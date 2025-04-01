const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require('./routes/adminRoutes');
const helpRequestRoutes = require('./routes/helpRequestRoutes');
const errorHandler = require('./middleware/errorMiddleware');
const mongoose = require('mongoose');

dotenv.config();
connectDB(); // Connect to MongoDB

const app = express();
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));