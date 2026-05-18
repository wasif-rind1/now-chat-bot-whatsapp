/**
 * Conversation Memory — KH WhatsApp Bot
 * Stores per-chat message history for context-aware AI replies
 */

const MAX_MESSAGES = parseInt(process.env.MAX_MEMORY) || 30;

// Map<chatId, Array<{role, content, name?, timestamp}>>
const conversationStore = new Map();

/**
 * Get conversation history for a chat
 */
function getConversation(chatId) {
  return conversationStore.get(chatId) || [];
}

/**
 * Add a message to conversation history
 */
function addMessage(chatId, role, content, name = null) {
  if (!conversationStore.has(chatId)) {
    conversationStore.set(chatId, []);
  }

  const history = conversationStore.get(chatId);
  const message = {
    role,
    content,
    timestamp: Date.now(),
  };

  // Add name for user messages (helps AI personalize)
  if (name && role === "user") {
    message.name = name.replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 64);
  }

  history.push(message);

  // Trim to max size (remove oldest messages first)
  if (history.length > MAX_MESSAGES) {
    history.splice(0, history.length - MAX_MESSAGES);
  }

  return history;
}

/**
 * Clear conversation history for a chat
 */
function clearConversation(chatId) {
  conversationStore.delete(chatId);
}

/**
 * Get number of stored messages for a chat
 */
function getConversationLength(chatId) {
  return (conversationStore.get(chatId) || []).length;
}

/**
 * Clear all conversations (e.g., on restart)
 */
function clearAllConversations() {
  conversationStore.clear();
}

/**
 * Auto-cleanup old conversations (older than 6 hours)
 */
function startAutoCleanup() {
  const SIX_HOURS = 6 * 60 * 60 * 1000;
  setInterval(() => {
    const now = Date.now();
    for (const [chatId, history] of conversationStore.entries()) {
      if (history.length === 0) {
        conversationStore.delete(chatId);
        continue;
      }
      const lastMsg = history[history.length - 1];
      if (lastMsg.timestamp && now - lastMsg.timestamp > SIX_HOURS) {
        conversationStore.delete(chatId);
      }
    }
  }, 30 * 60 * 1000); // Run every 30 minutes
}

startAutoCleanup();

module.exports = {
  getConversation,
  addMessage,
  clearConversation,
  getConversationLength,
  clearAllConversations,
};
