const { Server } = require('socket.io');
const Message = require('./models/messageModel');

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  const users = new Map(); // Map to store userId and socket.id

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Listen for user identification
    socket.on('identify', (userId) => {
      users.set(userId, socket.id); // Map userId to socket.id
      console.log(`User ${userId} is associated with socket ${socket.id}`);
    });

    // Handle sending messages
    socket.on('sendMessage', async ({ senderId, receiverId, text }) => {
      try {
        const message = new Message({ senderId, receiverId, text });
        await message.save();

        // Emit the message to the receiver if they are connected
        const receiverSocketId = users.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('newMessage', message);
        }

        // Optionally, emit the message back to the sender
        socket.emit('newMessage', message);
      } catch (error) {
        console.error('Error saving message:', error);
      }
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
      for (const [userId, socketId] of users.entries()) {
        if (socketId === socket.id) {
          users.delete(userId); // Remove the user from the map
          break;
        }
      }
    });
  });
};

module.exports = setupSocket;