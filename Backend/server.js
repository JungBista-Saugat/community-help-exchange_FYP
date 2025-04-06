const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require('./routes/userRoutes'); // Correctly import userRoutes
const adminRoutes = require('./routes/adminRoutes');
const helpRequestRoutes = require('./routes/helpRequestRoutes');
const errorHandler = require('./middleware/errorMiddleware');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const Message = require('./models/messageModel'); // Create a Message model

dotenv.config();
connectDB(); // Connect to MongoDB

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Frontend URL
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json()); // Parse JSON requests

// API Routes
app.use("/api/users", userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/help-requests', helpRequestRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Error handling middleware
app.use(errorHandler);

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle sending messages
  socket.on('sendMessage', async ({ senderId, receiverId, text }) => {
    const message = new Message({ senderId, receiverId, text });
    await message.save();

    // Emit the message to the receiver
    io.emit('newMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));