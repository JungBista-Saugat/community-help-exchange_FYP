const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");
const userRoutes = require('./routes/userRoutes'); // Correctly import userRoutes
const adminRoutes = require('./routes/adminRoutes');
const helpRequestRoutes = require('./routes/helpRequestRoutes');
const messageRoutes = require('./routes/messageRoutes');
const errorHandler = require('./middleware/errorMiddleware');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const Message = require('./models/messageModel'); // Create a Message model
const setupSocket = require('./socket'); // Import setupSocket
const morgan = require('morgan'); // Import morgan
const notificationRoutes = require('./routes/notificationRoutes');

dotenv.config();
connectDB(); // Connect to MongoDB

const app = express();
const server = http.createServer(app);

// Setup socket and get the socket instance
const socketInstance = setupSocket(server);

// security headers
app.use(helmet());

// enable CORS
app.use(cors());

// JSON body parsing
app.use(express.json());

// request logging
app.use(morgan('dev'));

// Make socket instance available to routes
app.set('socketInstance', socketInstance);

// API Routes
app.use("/api/users", userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/help-requests', helpRequestRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));

module.exports = { app, socketInstance };