/**
 * Utility Functions — KH WhatsApp Bot
 * Human-like delays, typing simulation, helpers
 */

/**
 * Simulate human typing delay based on message length
 * Roughly 40-60 WPM with some variance
 */
function humanDelay(textLength) {
  const CHARS_PER_SECOND = 8 + Math.random() * 6; // 8–14 chars/sec
  const baseDelay = (textLength / CHARS_PER_SECOND) * 1000;
  const variance = (Math.random() - 0.5) * 800;
  const delay = Math.min(Math.max(baseDelay + variance, 600), 5000);
  return sleep(delay);
}

/**
 * Simulate "thinking" delay before responding
 * Makes the bot feel like it's actually processing
 */
function randomThinkingDelay() {
  const delay = 800 + Math.random() * 1500; // 0.8–2.3 seconds
  return sleep(delay);
}

/**
 * Simple sleep helper
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Randomly pick an item from an array
 */
function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Format uptime to human-readable string
 */
function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/**
 * Truncate text with ellipsis
 */
function truncate(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}

/**
 * Check if a string contains any of the given keywords
 */
function containsAny(str, keywords) {
  const lower = str.toLowerCase();
  return keywords.some((k) => lower.includes(k.toLowerCase()));
}

/**
 * Simple markdown stripper for plain text fallback
 */
function stripMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/```[\s\S]*?```/g, "[code block]")
    .replace(/`(.*?)`/g, "$1")
    .trim();
}

module.exports = {
  humanDelay,
  randomThinkingDelay,
  sleep,
  randomPick,
  formatUptime,
  truncate,
  containsAny,
  stripMarkdown,
};
