const { Server } = require('socket.io');
const Message = require('./models/messageModel');

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('sendMessage', async ({ senderId, receiverId, text }) => {
      try {
        const message = new Message({ senderId, receiverId, text });
        await message.save();
        io.emit('newMessage', message);
      } catch (error) {
        console.error('Error saving message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
    });
  });
};

module.exports = setupSocket;