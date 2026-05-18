/**
 * Command Handler — KH WhatsApp Bot
 * Owner: Kamran Hasil
 */

const chalk = require("chalk");
const { clearConversation, getConversationLength } = require("./memory");
const { log } = require("./logger");

/**
 * Check if a message is a command
 */
function isCommand(body, prefix) {
  return body.startsWith(prefix);
}

/**
 * Parse command from message body
 */
function parseCommand(body, prefix) {
  const without = body.slice(prefix.length).trim();
  const parts = without.split(" ");
  return {
    command: parts[0].toLowerCase(),
    args: parts.slice(1),
    argString: parts.slice(1).join(" "),
  };
}

/**
 * Handle incoming command
 */
async function handleCommand({ msg, chat, contact, client, openai, isOwner, senderName, chatId, PREFIX }) {
  const { command, args, argString } = parseCommand(msg.body, PREFIX);

  log("cmd", `Command: ${command} | User: ${senderName} | Owner: ${isOwner}`);

  switch (command) {
    // ── Public Commands ──────────────────────────────────

    case "start":
    case "hi":
    case "hello":
      await msg.reply(
        `👋 Hey ${senderName}! I'm *KH Bot*, your smart AI assistant!\n\n` +
        `🤖 Created by *Kamran Hasil*\n` +
        `💬 Just chat with me naturally — I understand context!\n\n` +
        `📋 Type *${PREFIX}help* to see all commands.`
      );
      break;

    case "help":
      await msg.reply(buildHelpMenu(PREFIX, isOwner));
      break;

    case "ping":
      const start = Date.now();
      await msg.reply("🏓 Pong!");
      break;

    case "about":
      await msg.reply(
        `🤖 *KH Bot — AI WhatsApp Assistant*\n\n` +
        `👤 *Owner:* Kamran Hasil\n` +
        `⚡ *Engine:* GPT-4o by OpenAI\n` +
        `📦 *Version:* 2.0.0\n` +
        `🛠️ *Built with:* Node.js + whatsapp-web.js\n\n` +
        `_Bringing AI to your WhatsApp, one message at a time_ 🚀`
      );
      break;

    case "clear":
      clearConversation(chatId);
      await msg.reply("🗑️ Conversation memory cleared! Starting fresh.");
      break;

    case "memory":
      const len = getConversationLength(chatId);
      await msg.reply(`🧠 I remember *${len}* messages from our conversation.`);
      break;

    case "ask":
      if (!argString) {
        await msg.reply(`❓ Usage: *${PREFIX}ask <your question>*\n\nExample: ${PREFIX}ask What is quantum physics?`);
        return;
      }
      await handleAsk({ msg, chat, openai, argString, senderName, chatId });
      break;

    case "imagine":
      if (!argString) {
        await msg.reply(`🎨 Usage: *${PREFIX}imagine <description>*\n\nExample: ${PREFIX}imagine a sunset over mountains`);
        return;
      }
      await handleImageGeneration({ msg, openai, argString, senderName });
      break;

    case "translate":
      if (args.length < 2) {
        await msg.reply(`🌐 Usage: *${PREFIX}translate <language> <text>*\n\nExample: ${PREFIX}translate Spanish Hello, how are you?`);
        return;
      }
      await handleTranslate({ msg, chat, openai, args, chatId, senderName });
      break;

    case "summarize":
      if (!argString) {
        await msg.reply(`📝 Usage: *${PREFIX}summarize <long text>*`);
        return;
      }
      await handleSummarize({ msg, chat, openai, argString, chatId, senderName });
      break;

    case "joke":
      await handleJoke({ msg, chat, openai, chatId, senderName });
      break;

    case "quote":
      await handleQuote({ msg, chat, openai, chatId, senderName });
      break;

    case "roast":
      if (!argString) {
        await msg.reply(`🔥 Usage: *${PREFIX}roast <name or topic>*\n\nExample: ${PREFIX}roast Monday mornings`);
        return;
      }
      await handleRoast({ msg, chat, openai, argString, chatId, senderName });
      break;

    case "fix":
      if (!argString) {
        await msg.reply(`🛠️ Usage: *${PREFIX}fix <your code>*`);
        return;
      }
      await handleCodeFix({ msg, chat, openai, argString, chatId, senderName });
      break;

    case "recipe":
      if (!argString) {
        await msg.reply(`🍳 Usage: *${PREFIX}recipe <dish name>*\n\nExample: ${PREFIX}recipe biryani`);
        return;
      }
      await handleRecipe({ msg, chat, openai, argString, chatId, senderName });
      break;

    // ── Owner-Only Commands ──────────────────────────────

    case "broadcast":
      if (!isOwner) { await msg.reply("🚫 This command is for the owner only."); return; }
      if (!argString) { await msg.reply(`📢 Usage: *${PREFIX}broadcast <message>*`); return; }
      await handleBroadcast({ client, msg, argString });
      break;

    case "status":
      if (!isOwner) { await msg.reply("🚫 This command is for the owner only."); return; }
      await handleBotStatus({ msg, client });
      break;

    case "setname":
      if (!isOwner) { await msg.reply("🚫 This command is for the owner only."); return; }
      if (!argString) { await msg.reply(`Usage: *${PREFIX}setname <new name>*`); return; }
      await client.setDisplayName(argString).catch(() => {});
      await msg.reply(`✅ Display name updated to: *${argString}*`);
      break;

    case "restart":
      if (!isOwner) { await msg.reply("🚫 This command is for the owner only."); return; }
      await msg.reply("🔄 Restarting bot...");
      setTimeout(() => process.exit(0), 2000);
      break;

    default:
      await msg.reply(
        `❓ Unknown command: *${PREFIX}${command}*\n\nType *${PREFIX}help* to see all available commands.`
      );
  }
}

// ─── AI-Powered Command Handlers ──────────────────────────

async function handleAsk({ msg, chat, openai, argString, senderName, chatId }) {
  await chat.sendStateTyping();
  const res = await openai.chat.completions.create({
    model: process.env.GPT_MODEL || "gpt-4o",
    messages: [
      { role: "system", content: `You are KH Bot, a helpful AI assistant created by Kamran Hasil. Answer concisely and clearly. The user's name is ${senderName}.` },
      { role: "user", content: argString },
    ],
    max_tokens: 600,
    temperature: 0.7,
  });
  await chat.clearState();
  await msg.reply(`💡 ${res.choices[0].message.content.trim()}`);
}

async function handleImageGeneration({ msg, openai, argString, senderName }) {
  await msg.reply("🎨 Generating your image... please wait a moment!");
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: argString,
      n: 1,
      size: "1024x1024",
    });
    const imageUrl = response.data[0].url;
    const { MessageMedia } = require("whatsapp-web.js");
    const media = await MessageMedia.fromUrl(imageUrl, { unsafeMime: true });
    await msg.reply(media, undefined, { caption: `🎨 *Generated Image*\n_Prompt: ${argString}_\n\n_By KH Bot | Owner: Kamran Hasil_` });
  } catch (err) {
    await msg.reply("❌ Image generation failed. Please try a different prompt.");
  }
}

async function handleTranslate({ msg, chat, openai, args, chatId, senderName }) {
  const targetLang = args[0];
  const textToTranslate = args.slice(1).join(" ");
  await chat.sendStateTyping();
  const res = await openai.chat.completions.create({
    model: process.env.GPT_MODEL || "gpt-4o",
    messages: [
      { role: "system", content: "You are a professional translator. Translate the given text accurately. Return ONLY the translated text, nothing else." },
      { role: "user", content: `Translate to ${targetLang}: ${textToTranslate}` },
    ],
    max_tokens: 400,
    temperature: 0.3,
  });
  await chat.clearState();
  await msg.reply(`🌐 *Translation to ${targetLang}:*\n\n${res.choices[0].message.content.trim()}`);
}

async function handleSummarize({ msg, chat, openai, argString, chatId, senderName }) {
  await chat.sendStateTyping();
  const res = await openai.chat.completions.create({
    model: process.env.GPT_MODEL || "gpt-4o",
    messages: [
      { role: "system", content: "Summarize the following text into clear, concise bullet points. Be brief but complete." },
      { role: "user", content: argString },
    ],
    max_tokens: 400,
    temperature: 0.5,
  });
  await chat.clearState();
  await msg.reply(`📝 *Summary:*\n\n${res.choices[0].message.content.trim()}`);
}

async function handleJoke({ msg, chat, openai, chatId, senderName }) {
  await chat.sendStateTyping();
  const res = await openai.chat.completions.create({
    model: process.env.GPT_MODEL || "gpt-4o",
    messages: [
      { role: "system", content: "You are a comedian. Tell one short, funny, clean joke. Just the joke, no extra commentary." },
      { role: "user", content: "Tell me a funny joke!" },
    ],
    max_tokens: 200,
    temperature: 1.0,
  });
  await chat.clearState();
  await msg.reply(`😂 ${res.choices[0].message.content.trim()}`);
}

async function handleQuote({ msg, chat, openai, chatId, senderName }) {
  await chat.sendStateTyping();
  const res = await openai.chat.completions.create({
    model: process.env.GPT_MODEL || "gpt-4o",
    messages: [
      { role: "system", content: "Share one powerful, inspiring quote with its author. Format: \"Quote\" — Author" },
      { role: "user", content: "Give me an inspiring quote." },
    ],
    max_tokens: 150,
    temperature: 0.9,
  });
  await chat.clearState();
  await msg.reply(`✨ *Quote of the Moment:*\n\n${res.choices[0].message.content.trim()}`);
}

async function handleRoast({ msg, chat, openai, argString, chatId, senderName }) {
  await chat.sendStateTyping();
  const res = await openai.chat.completions.create({
    model: process.env.GPT_MODEL || "gpt-4o",
    messages: [
      { role: "system", content: "You are a witty comedian. Create a funny, light-hearted roast. Keep it playful and not genuinely hurtful." },
      { role: "user", content: `Roast: ${argString}` },
    ],
    max_tokens: 250,
    temperature: 1.0,
  });
  await chat.clearState();
  await msg.reply(`🔥 *Roast incoming!*\n\n${res.choices[0].message.content.trim()}`);
}

async function handleCodeFix({ msg, chat, openai, argString, chatId, senderName }) {
  await chat.sendStateTyping();
  const res = await openai.chat.completions.create({
    model: process.env.GPT_MODEL || "gpt-4o",
    messages: [
      { role: "system", content: "You are an expert programmer. Review the code, fix any bugs, and explain what was wrong briefly." },
      { role: "user", content: `Fix this code:\n\n${argString}` },
    ],
    max_tokens: 800,
    temperature: 0.4,
  });
  await chat.clearState();
  await msg.reply(`🛠️ *Code Fixed:*\n\n${res.choices[0].message.content.trim()}`);
}

async function handleRecipe({ msg, chat, openai, argString, chatId, senderName }) {
  await chat.sendStateTyping();
  const res = await openai.chat.completions.create({
    model: process.env.GPT_MODEL || "gpt-4o",
    messages: [
      { role: "system", content: "You are a professional chef. Give a simple, easy-to-follow recipe with ingredients and steps. Be concise." },
      { role: "user", content: `How to make ${argString}?` },
    ],
    max_tokens: 600,
    temperature: 0.6,
  });
  await chat.clearState();
  await msg.reply(`🍳 *Recipe: ${argString}*\n\n${res.choices[0].message.content.trim()}`);
}

// ─── Owner Commands ───────────────────────────────────────

async function handleBroadcast({ client, msg, argString }) {
  const chats = await client.getChats();
  let sent = 0;
  await msg.reply(`📢 Broadcasting to ${chats.length} chats...`);
  for (const c of chats) {
    try {
      await c.sendMessage(`📢 *Broadcast from KH Bot*\n\n${argString}\n\n_— Kamran Hasil_`);
      sent++;
      await new Promise(r => setTimeout(r, 1500)); // avoid spam ban
    } catch {}
  }
  await msg.reply(`✅ Broadcast sent to ${sent}/${chats.length} chats.`);
}

async function handleBotStatus({ msg, client }) {
  const info = client.info;
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  const mem = process.memoryUsage();
  await msg.reply(
    `📊 *KH Bot Status*\n\n` +
    `👤 *Connected as:* ${info?.pushname || "Unknown"}\n` +
    `📱 *Phone:* +${info?.wid?.user || "Unknown"}\n` +
    `⏱️ *Uptime:* ${hours}h ${minutes}m ${seconds}s\n` +
    `💾 *Memory:* ${Math.round(mem.rss / 1024 / 1024)} MB\n` +
    `🤖 *Model:* ${process.env.GPT_MODEL || "gpt-4o"}\n` +
    `👑 *Owner:* Kamran Hasil\n` +
    `✅ *Status:* Online & Running`
  );
}

// ─── Help Menu ────────────────────────────────────────────
function buildHelpMenu(prefix, isOwner) {
  let menu = `🤖 *KH Bot — Command Menu*\n_Created by Kamran Hasil_\n\n`;

  menu += `📌 *General*\n`;
  menu += `${prefix}help — Show this menu\n`;
  menu += `${prefix}about — About this bot\n`;
  menu += `${prefix}ping — Check if bot is alive\n`;
  menu += `${prefix}clear — Clear conversation memory\n`;
  menu += `${prefix}memory — Show memory size\n\n`;

  menu += `🧠 *AI Commands*\n`;
  menu += `${prefix}ask <question> — Ask anything\n`;
  menu += `${prefix}imagine <prompt> — Generate an image\n`;
  menu += `${prefix}translate <lang> <text> — Translate text\n`;
  menu += `${prefix}summarize <text> — Summarize long text\n`;
  menu += `${prefix}fix <code> — Fix & explain code\n\n`;

  menu += `🎭 *Fun*\n`;
  menu += `${prefix}joke — Get a random joke\n`;
  menu += `${prefix}quote — Get an inspiring quote\n`;
  menu += `${prefix}roast <topic> — Roast something\n`;
  menu += `${prefix}recipe <dish> — Get a recipe\n`;

  if (isOwner) {
    menu += `\n👑 *Owner Commands*\n`;
    menu += `${prefix}broadcast <msg> — Broadcast to all\n`;
    menu += `${prefix}status — Bot system status\n`;
    menu += `${prefix}setname <name> — Change display name\n`;
    menu += `${prefix}restart — Restart the bot\n`;
  }

  menu += `\n💬 Or just chat with me naturally — no commands needed!`;
  return menu;
}

module.exports = { handleCommand, isCommand };
