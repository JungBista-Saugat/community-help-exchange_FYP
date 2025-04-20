const Message = require('../models/messageModel');

// @desc    Create a new message
// @route   POST /api/messages
// @access  Private
const createMessage = async (req, res) => {
  try {
    const { senderId, receiverId, text } = req.body;

    // Validate input
    if (!senderId || !receiverId || !text) {
      return res.status(400).json({ 
        message: 'Please provide all required fields',
        details: {
          senderId: !senderId ? 'Missing sender ID' : undefined,
          receiverId: !receiverId ? 'Missing receiver ID' : undefined,
          text: !text ? 'Missing message text' : undefined
        }
      });
    }

    // Create and save the message
    const message = new Message({
      senderId,
      receiverId,
      text
    });

    const savedMessage = await message.save();
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ message: 'Error creating message', error: error.message });
  }
};

// @desc    Get messages between two users
// @route   GET /api/messages/conversation/:userId1/:userId2
// @access  Private
const getMessagesBetweenUsers = async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;

    if (!userId1 || !userId2) {
      return res.status(400).json({ message: 'Both user IDs are required' });
    }

    const messages = await Message.find({
      $or: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
};

// @desc    Get all messages for a user
// @route   GET /api/messages/user/:userId
// @access  Private
const getUserMessages = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching user messages:', error);
    res.status(500).json({ message: 'Error fetching user messages', error: error.message });
  }
};

module.exports = {
  createMessage,
  getMessagesBetweenUsers,
  getUserMessages
}; 