require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const http = require("http");
const path = require("path");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const aiRoutes = require("./routes/aiRoutes");
const mpesaRoutes = require("./routes/mpesaRoutes");
const { trainModel } = require("./models/pricePredictionModel");
const setupSocket = require("./socket");
const chatRoutes = require("./routes/chatRoutes");
const adminRoutes = require("./routes/adminRoutes");
const messageRoutes = require('./routes/messageRoutes');

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.FRONTEND_URL
].filter(Boolean);

console.log("BLOCKCHAIN_RPC_URL:", process.env.BLOCKCHAIN_RPC_URL);
console.log("Allowed Origins:", ALLOWED_ORIGINS);

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO first
const io = setupSocket(server);
app.set('io', io); // Store io instance in app

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (ALLOWED_ORIGINS.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(morgan("dev"));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

connectDB();
trainModel();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/mpesa", mpesaRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error details:');
  console.error('Message:', err.message);
  console.error('Stack:', err.stack);
  console.error('Request path:', req.path);
  console.error('Request method:', req.method);
  console.error('Request headers:', req.headers);
  console.error('Request body:', req.body);
  
  res.status(500).json({ 
    message: "Something went wrong!",
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
});
