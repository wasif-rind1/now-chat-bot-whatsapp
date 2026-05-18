# 🤖 KH WhatsApp AI Bot

> **Advanced WhatsApp chatbot powered by GPT-4o — by Kamran Hasil**

A human-like, feature-rich WhatsApp bot with conversation memory, 15+ commands, image generation, translation, and more.

---

## ✨ Features

- 🧠 **GPT-4o Powered** — Intelligent, context-aware conversations
- 💬 **Human-like Behavior** — Realistic typing delays, natural tone
- 🗃️ **Conversation Memory** — Remembers context across messages
- 🌐 **Multilingual** — Replies in the user's language automatically
- 🎨 **DALL-E 3 Image Gen** — Generate images from text descriptions
- 🌍 **Translation** — Translate to any language
- 📝 **Summarizer** — Condense long texts
- 🛠️ **Code Fixer** — Debug and fix code
- 🍳 **Recipe Generator** — Get recipes on demand
- ⚡ **Rate Limiting** — Prevent spam and API abuse
- 👑 **Owner Panel** — Exclusive commands for Kamran Hasil
- 📢 **Broadcast** — Send messages to all chats (owner only)
- 🔄 **Auto-Reconnect** — Stays online automatically
- 📋 **File Logging** — Optional log file output

---

## 📋 Requirements

| Tool    | Version |
|---------|---------|
| Node.js | ≥ 18.0  |
| npm     | ≥ 8.0   |
| Chrome/Chromium | (auto-installed via Puppeteer) |

---

## 🚀 Installation

### Step 1 — Clone or Download

```bash
# If you have git:
git clone https://github.com/yourusername/kh-whatsapp-bot.git
cd kh-whatsapp-bot

# Or just place all files in a folder called kh-whatsapp-bot
```

### Step 2 — Install Dependencies

```bash
npm install
```

> ⏳ This takes 2–3 minutes (downloads Chromium for Puppeteer)

### Step 3 — Configure Environment

```bash
cp .env.example .env
```

Open `.env` and fill in:

```env
OPENAI_API_KEY=sk-your-key-here       # From platform.openai.com
OWNER_NUMBER=923001234567             # Your number (no + or spaces)
```

### Step 4 — Start the Bot

```bash
npm start
```

### Step 5 — Scan QR Code

A QR code appears in your terminal. Open WhatsApp on your phone:

```
WhatsApp → Settings → Linked Devices → Link a Device
```

Scan the QR code. The bot goes online in ~10 seconds! ✅

---

## 💬 Commands

| Command | Description |
|---------|-------------|
| `!help` | Show all commands |
| `!about` | About KH Bot |
| `!ping` | Check if bot is alive |
| `!clear` | Clear conversation memory |
| `!ask <question>` | Ask the AI anything |
| `!imagine <prompt>` | Generate an image (DALL-E 3) |
| `!translate <lang> <text>` | Translate text |
| `!summarize <text>` | Summarize long content |
| `!fix <code>` | Debug & fix code |
| `!joke` | Get a random joke |
| `!quote` | Get an inspiring quote |
| `!roast <topic>` | Roast something fun |
| `!recipe <dish>` | Get a recipe |

### 👑 Owner-Only Commands (Kamran Hasil)

| Command | Description |
|---------|-------------|
| `!broadcast <msg>` | Send to all chats |
| `!status` | Bot system info |
| `!setname <name>` | Change display name |
| `!restart` | Restart the bot |

---

## 📱 Natural Chat (No Commands Needed!)

Just send any message and the bot will reply intelligently:

```
You:  hey what's up
Bot:  Not much, just here vibing! What's going on with you? 😄

You:  can you help me write an email to my boss
Bot:  Sure! What's the email about? Give me the key points
      and I'll draft something professional for you 💪
```

---

## 🔧 Configuration Reference

Edit `.env` to customize:

| Variable | Default | Description |
|----------|---------|-------------|
| `GPT_MODEL` | `gpt-4o` | OpenAI model |
| `MAX_TOKENS` | `500` | Max reply length |
| `TEMPERATURE` | `0.85` | Creativity (0–1) |
| `PREFIX` | `!` | Command prefix |
| `REPLY_IN_GROUPS` | `false` | Reply in group chats |
| `MAX_MEMORY` | `30` | Messages to remember |
| `RATE_LIMIT` | `15` | Messages per minute |
| `LOG_TO_FILE` | `false` | Save logs to file |

---

## 🔁 Keep Bot Running 24/7 (Recommended)

### Using PM2

```bash
npm install -g pm2
pm2 start index.js --name kh-bot
pm2 save
pm2 startup   # Auto-start on system reboot
```

Useful PM2 commands:
```bash
pm2 logs kh-bot       # View live logs
pm2 restart kh-bot    # Restart bot
pm2 stop kh-bot       # Stop bot
pm2 status            # Check status
```

---

## 🐛 Troubleshooting

**QR code not appearing?**
```bash
# Delete saved session and try again
rm -rf .wwebjs_auth
npm start
```

**Puppeteer/Chrome error on Linux?**
```bash
sudo apt-get install -y chromium-browser
```

**Bot not responding?**
- Check your `OPENAI_API_KEY` is valid
- Ensure you have OpenAI credits
- Check logs for error messages

**Session expired?**
```bash
rm -rf .wwebjs_auth
npm start
# Scan QR code again
```

---

## 📁 Project Structure

```
kh-whatsapp-bot/
├── index.js          # Main bot entry point
├── .env              # Your config (never share this!)
├── .env.example      # Config template
├── package.json      # Dependencies
├── src/
│   ├── commands.js   # All bot commands
│   ├── memory.js     # Conversation memory
│   ├── utils.js      # Helpers & delays
│   └── logger.js     # Colored logging
├── logs/             # Log files (if enabled)
└── .wwebjs_auth/     # WhatsApp session (auto-created)
```

---

## ⚠️ Important Notes

- **This bot uses your WhatsApp account** — use responsibly
- **Don't spam** — WhatsApp may ban accounts used for bulk messaging
- **Keep `.env` private** — Never share your API keys
- **OpenAI costs** — Monitor your API usage at platform.openai.com

---

## 👑 Credits

**Owner & Creator:** Kamran Hasil  
**Built with:** Node.js, whatsapp-web.js, OpenAI GPT-4o  
**Version:** 2.0.0

---

*KH Bot — Bringing AI to WhatsApp, one message at a time* 🚀
