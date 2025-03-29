const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

function setupSocket(server) {
  const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

  const io = new Server(server, {
    cors: {
      origin: FRONTEND_URL,
      methods: ["GET", "POST"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"]
    },
    path: "/socket.io",
    transports: ["websocket", "polling"]
  });

  // Add authentication middleware to main namespace
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      console.error("Socket authentication error:", err.message);
      next(new Error("Authentication error: Invalid token"));
    }
  });

  // Handle main namespace connections
  io.on("connection", (socket) => {
    console.log("User connected:", socket.userId);

    // Join user's room
    socket.join(socket.userId);

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.userId);
    });
  });

  // Create a namespace for chat
  const chatNamespace = io.of("/api/chat");

  // Add authentication middleware to chat namespace
  chatNamespace.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      console.error("Socket authentication error:", err.message);
      next(new Error("Authentication error: Invalid token"));
    }
  });

  chatNamespace.on("connection", (socket) => {
    console.log("User connected to chat:", socket.userId);

    // Join user's room
    socket.join(socket.userId);

    socket.on("join conversation", (conversationId) => {
      socket.join(conversationId);
      console.log(`User ${socket.userId} joined conversation ${conversationId}`);
    });

    socket.on("leave conversation", (conversationId) => {
      socket.leave(conversationId);
      console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });

    socket.on("new message", async (data) => {
      const { conversationId, message } = data;
      
      // Emit to all participants in the conversation
      chatNamespace.to(conversationId).emit("message received", {
        conversationId,
        message,
        sender: socket.userId,
        timestamp: new Date()
      });
      console.log(`Message sent in conversation ${conversationId} by user ${socket.userId}`);
    });

    socket.on("typing", (data) => {
      const { conversationId } = data;
      socket.to(conversationId).emit("user typing", { userId: socket.userId });
    });

    socket.on("stop typing", (data) => {
      const { conversationId } = data;
      socket.to(conversationId).emit("user stop typing", { userId: socket.userId });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected from chat:", socket.userId);
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });

  return io;
}

module.exports = setupSocket;
