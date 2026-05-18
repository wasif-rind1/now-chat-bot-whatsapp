/**
 * Logger — KH WhatsApp Bot
 * Colored, timestamped console output + optional file logging
 */

const chalk = require("chalk");
const fs = require("fs");
const path = require("path");

const LOG_TO_FILE = process.env.LOG_TO_FILE === "true";
const LOG_FILE = path.join(process.cwd(), "logs", "bot.log");

// Create logs directory if file logging enabled
if (LOG_TO_FILE) {
  const logsDir = path.join(process.cwd(), "logs");
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
}

const LEVELS = {
  info: { color: chalk.cyan, icon: "ℹ️ " },
  msg:  { color: chalk.white, icon: "💬" },
  bot:  { color: chalk.green, icon: "🤖" },
  cmd:  { color: chalk.yellow, icon: "⚡" },
  warn: { color: chalk.yellow, icon: "⚠️ " },
  error: { color: chalk.red, icon: "❌" },
  success: { color: chalk.greenBright, icon: "✅" },
};

function log(level, message) {
  const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false });
  const { color, icon } = LEVELS[level] || LEVELS.info;
  const formatted = `${chalk.gray(`[${timestamp}]`)} ${icon}  ${color(message)}`;
  console.log(formatted);

  if (LOG_TO_FILE) {
    const plain = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}\n`;
    fs.appendFile(LOG_FILE, plain, () => {});
  }
}

module.exports = { log };
