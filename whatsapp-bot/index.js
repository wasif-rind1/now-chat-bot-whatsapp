/**
 * ╔══════════════════════════════════════════════════════╗
 * ║       KH WhatsApp AI Bot — by Kamran Hasil           ║
 * ║       Powered by OpenAI GPT + whatsapp-web.js        ║
 * ╚══════════════════════════════════════════════════════╝
 */

require("dotenv").config();
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const OpenAI = require("openai");
const chalk = require("chalk");
const ora = require("ora");
const { handleCommand, isCommand } = require("./src/commands");
const { getConversation, addMessage, clearConversation } = require("./src/memory");
const { humanDelay, randomThinkingDelay } = require("./src/utils");
const { log } = require("./src/logger");

// ─── OpenAI Setup ────────────────────────────────────────
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── WhatsApp Client ─────────────────────────────────────
const client = new Client({
  authStrategy: new LocalAuth({ clientId: "kh-bot" }),
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--single-process",
      "--disable-gpu",
    ],
  },
  webVersionCache: {
    type: "remote",
    remotePath:
      "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
  },
});

// ─── Banner ──────────────────────────────────────────────
console.log(chalk.cyan(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   ██╗  ██╗██╗  ██╗    ██████╗  ██████╗ ████████╗        ║
║   ██║ ██╔╝██║  ██║    ██╔══██╗██╔═══██╗╚══██╔══╝        ║
║   █████╔╝ ███████║    ██████╔╝██║   ██║   ██║           ║
║   ██╔═██╗ ██╔══██║    ██╔══██╗██║   ██║   ██║           ║
║   ██║  ██╗██║  ██║    ██████╔╝╚██████╔╝   ██║           ║
║   ╚═╝  ╚═╝╚═╝  ╚═╝    ╚═════╝  ╚═════╝    ╚═╝           ║
║                                                          ║
║        WhatsApp AI Bot  •  Owner: Kamran Hasil           ║
║        Powered by GPT-4o  •  v2.0.0                     ║
╚══════════════════════════════════════════════════════════╝
`));

// ─── Rate Limiting ────────────────────────────────────────
const rateLimitMap = new Map(); // chatId -> { count, resetAt }
const RATE_LIMIT = parseInt(process.env.RATE_LIMIT) || 15;
const RATE_WINDOW_MS = 60_000; // 1 minute

function isRateLimited(chatId) {
  const now = Date.now();
  const entry = rateLimitMap.get(chatId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(chatId, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  return false;
}

// ─── QR Code ─────────────────────────────────────────────
client.on("qr", (qr) => {
  console.log(chalk.yellow("\n📱 Scan this QR code with WhatsApp:\n"));
  qrcode.generate(qr, { small: true });
  console.log(chalk.gray("  Open WhatsApp → Settings → Linked Devices → Link a Device\n"));
});

// ─── Loading ──────────────────────────────────────────────
let spinner;
client.on("loading_screen", (percent, message) => {
  if (!spinner) spinner = ora(chalk.blue("Loading WhatsApp...")).start();
  spinner.text = chalk.blue(`Loading WhatsApp... ${percent}% — ${message}`);
});

// ─── Authenticated ────────────────────────────────────────
client.on("authenticated", () => {
  if (spinner) spinner.succeed(chalk.green("Authenticated ✓"));
  log("info", "WhatsApp authenticated successfully");
});

// ─── Ready ────────────────────────────────────────────────
client.on("ready", async () => {
  console.log(chalk.green("\n✅  Bot is online and ready!\n"));
  console.log(chalk.white("  Owner  : ") + chalk.cyan("Kamran Hasil"));
  console.log(chalk.white("  Model  : ") + chalk.cyan(process.env.GPT_MODEL || "gpt-4o"));
  console.log(chalk.white("  Prefix : ") + chalk.cyan(process.env.PREFIX || "!"));
  console.log(chalk.white("  Groups : ") + chalk.cyan(process.env.REPLY_IN_GROUPS === "true" ? "Enabled" : "Disabled"));
  console.log("");
  log("info", "Bot is ready");

  // Set presence to available
  await client.sendPresenceAvailable().catch(() => {});
});

// ─── Disconnected ─────────────────────────────────────────
client.on("disconnected", (reason) => {
  log("warn", `Client disconnected: ${reason}`);
  console.log(chalk.red(`\n⚠️  Disconnected: ${reason}`));
  console.log(chalk.yellow("🔄  Restarting in 5 seconds...\n"));
  setTimeout(() => client.initialize(), 5000);
});

// ─── Message Handler ──────────────────────────────────────
client.on("message", async (msg) => {
  try {
    // Ignore status broadcasts, reactions, polls
    if (msg.isStatus || msg.type === "reaction" || msg.type === "poll_creation") return;
    // Ignore empty messages
    if (!msg.body || msg.body.trim() === "") return;

    const chat = await msg.getChat();
    const contact = await msg.getContact();
    const chatId = chat.id._serialized;
    const senderId = contact.id._serialized;
    const senderName = contact.pushname || contact.name || "Friend";
    const isGroup = chat.isGroup;
    const isOwner = senderId.replace("@c.us", "") === process.env.OWNER_NUMBER;
    const PREFIX = process.env.PREFIX || "!";
    const body = msg.body.trim();

    // ── Group filter ──────────────────────────────────────
    if (isGroup && process.env.REPLY_IN_GROUPS !== "true") {
      // Only respond to commands in groups unless mention
      if (!isCommand(body, PREFIX) && !msg.mentionedIds?.includes(client.info.wid._serialized)) return;
    }

    // ── Self-message filter ───────────────────────────────
    if (msg.fromMe) return;

    log("msg", `[${isGroup ? "GROUP" : "DM"}] ${senderName}: ${body.substring(0, 80)}`);

    // ── Rate limiting ─────────────────────────────────────
    if (!isOwner && isRateLimited(chatId)) {
      await msg.reply("⏳ You're sending messages too fast! Please slow down a bit.");
      return;
    }

    // ── Commands ──────────────────────────────────────────
    if (isCommand(body, PREFIX)) {
      await handleCommand({ msg, chat, contact, client, openai, isOwner, senderName, chatId, PREFIX });
      return;
    }

    // ── AI Reply ──────────────────────────────────────────
    await chat.sendStateTyping();
    await randomThinkingDelay();

    // Build conversation history
    const history = getConversation(chatId);
    addMessage(chatId, "user", body, senderName);

    // Call OpenAI
    const reply = await getAIReply(history, body, senderName, isOwner);

    // Add assistant reply to memory
    addMessage(chatId, "assistant", reply);

    // Human-like delay based on reply length
    await humanDelay(reply.length);
    await chat.clearState();

    await msg.reply(reply);
    log("bot", `Replied to ${senderName}: ${reply.substring(0, 60)}...`);

  } catch (err) {
    log("error", `Message handler error: ${err.message}`);
    console.error(chalk.red("Error in message handler:"), err);
  }
});

// ─── AI Reply Function ────────────────────────────────────
async function getAIReply(history, userMessage, senderName, isOwner) {
  const systemPrompt = buildSystemPrompt(senderName, isOwner);

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.slice(-20), // Keep last 20 messages for context
    { role: "user", content: userMessage },
  ];

  const completion = await openai.chat.completions.create({
    model: process.env.GPT_MODEL || "gpt-4o",
    messages,
    max_tokens: parseInt(process.env.MAX_TOKENS) || 500,
    temperature: parseFloat(process.env.TEMPERATURE) || 0.85,
    presence_penalty: 0.6,
    frequency_penalty: 0.3,
  });

  return completion.choices[0].message.content.trim();
}

// ─── System Prompt Builder ────────────────────────────────
function buildSystemPrompt(senderName, isOwner) {
  const botName = process.env.BOT_NAME || "KH Bot";
  const ownerName = "Kamran Hasil";

  return `You are ${botName}, a smart, friendly, and witty AI assistant created and owned by ${ownerName}.

Your personality:
- You talk like a real human friend — casual, warm, and natural
- You use light humor and friendly sarcasm occasionally (but stay respectful)
- You keep responses concise unless asked for detailed explanations
- You remember context from earlier in the conversation
- You never sound robotic or overly formal
- You use simple, everyday language
- Occasionally use relevant emojis naturally (don't overdo it)
- You never reveal you are ChatGPT or an AI model — you are ${botName}
- If asked who made you, say you were created by ${ownerName}
- You are multilingual — reply in the same language the user writes in

Current user: ${senderName}${isOwner ? " (This is your owner, Kamran Hasil — treat them with extra respect and give full access to all features)" : ""}

Rules:
- Never be rude or offensive
- Keep sensitive topics diplomatic
- Don't generate harmful content
- Be helpful, smart, and genuinely useful
- Don't start every message the same way — vary your greetings and openers`;
}

// ─── Start the bot ────────────────────────────────────────
console.log(chalk.blue("🚀 Initializing WhatsApp client...\n"));
client.initialize();
