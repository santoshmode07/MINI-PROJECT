const ragService = require('../utils/ragService');

/**
 * Handles RAG chat requests.
 * Expects { question, threadId, filter } in request body.
 * filter is optional e.g. { category: 'passenger' }
 */
exports.chat = async (req, res) => {
  try {
    const { question, threadId, filter } = req.body;

    if (!question || !threadId) {
      return res.status(400).json({ error: 'Question and threadId are required.' });
    }

    // Construct Qdrant filter if provided
    let qdrantFilter = null;
    if (filter && typeof filter === 'object') {
       // Convert key-value object to Qdrant filter format
       // Example input: { category: 'passenger' }
       qdrantFilter = {
         must: Object.entries(filter).map(([key, value]) => ({
           key: `metadata.${key}`,
           match: { value }
         }))
       };
    }

    const answer = await ragService.ask(question, threadId, qdrantFilter);

    res.json({
      success: true,
      threadId,
      answer
    });
  } catch (error) {
    console.error('RAG Error:', error);
    res.status(500).json({
      error: 'Error processing your request',
      details: error.message
    });
  }
};

/**
 * Resets or clears chat history for a thread.
 */
exports.clearHistory = async (req, res) => {
  try {
    const { threadId } = req.body;
    const ChatSession = require('../models/ChatSession');
    
    await ChatSession.deleteOne({ threadId });
    
    res.json({ success: true, message: `History for ${threadId} cleared.` });
  } catch (error) {
    res.status(500).json({ error: 'Error clearing history' });
  }
};
