const { Server } = require('socket.io');
const Message = require('./models/messageModel');

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  // Map to store userId and socket.id (for persistent connection)
  const users = new Map(); 

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Listen for user identification
    socket.on('identify', (userId) => {
      // Remove any existing socket mappings for this user
      for (const [existingUserId, existingSocketId] of users.entries()) {
        if (existingUserId === userId) {
          users.delete(existingUserId);
        }
      }
      users.set(userId, socket.id); // Map userId to socket.id
      console.log(`User ${userId} is associated with socket ${socket.id}`);
    });

    // Handle sending messages
    socket.on('sendMessage', async (message) => {
      try {
        // If message is not already saved (has no _id), save it
        if (!message._id) {
          const newMessage = new Message({
            senderId: message.senderId,
            receiverId: message.receiverId,
            text: message.text
          });
          message = await newMessage.save();
        }

        // Get receiver's socket id
        const receiverSocketId = users.get(message.receiverId);
        
        // Send to receiver if they are connected
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('newMessage', message);
        }

        // Send back to sender's socket to confirm delivery
        const senderSocketId = users.get(message.senderId);
        if (senderSocketId && senderSocketId !== socket.id) {
          io.to(senderSocketId).emit('newMessage', message);
        } else {
          socket.emit('newMessage', message);
        }
      } catch (error) {
        console.error('Error handling message:', error);
        socket.emit('messageError', { error: 'Failed to process message' });
      }
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
      for (const [userId, socketId] of users.entries()) {
        if (socketId === socket.id) {
          users.delete(userId);
          console.log(`User ${userId} has been removed from active users`);
          break;
        }
      }
    });
  });

  // Function to send notification to a specific user
  const sendNotification = (userId, notification) => {
    const socketId = users.get(userId);
    if (socketId) {
      io.to(socketId).emit('notification', notification);
      console.log(`Notification sent to user ${userId}`);
      return true;
    }
    console.log(`User ${userId} is not connected, notification not sent`);
    return false;
  };

  return { io, sendNotification };
};

module.exports = setupSocket;