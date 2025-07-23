const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Use your frontend URL in production
        methods: ["GET", "POST"]
    }
});

const chat = require("./models/chatModel"); // Assuming you have a chat model defined
const router = require("./routes/messageRoutes");

io.on("connection", (socket) => {
    console.log("🟢 Client connected:", socket.id);
    socket.on("sendMessage", async (data) => {
        const { sender, receiver, message } = data;

        console.log("📨 Received:", data);

        // Save message to MongoDB
        try {
            const newMessage = new chat({
                sender,
                receiver,
                message,
                timestamp: new Date()
            });
            await newMessage.save();
            console.log("✅ Message saved to MongoDB");
        } catch (error) {
            console.error("Error saving message to MongoDB:", error);
        }

        // Emit message to all connected clients
        socket.broadcast.emit("receiveMessage", data);
    });
    socket.on("disconnect", () => {
        console.log("🔴 Client disconnected:", socket.id);
    });
});


    app.use(cors());
    app.use(express.json());
    app.use("/api/messages", router);

    // Connect to MongoDB Atlas
    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => console.log("✅ MongoDB Connected"))
        .catch((err) => console.error("MongoDB Error:", err));

    // Optional: REST API route for message storage
    app.use("/api/messages", require("./routes/messageRoutes"));

    // Socket.IO Connection
    io.on("connection", (socket) => {
        console.log("🟢 Client connected:", socket.id);

        socket.on("sendMessage", (data) => {
            console.log("📨 Received:", data);
            io.emit("receiveMessage", data);
        });

        socket.on("disconnect", () => {
            console.log("🔴 Client disconnected:", socket.id);
        });
    });

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`🚀 Server listening on port ${PORT}`);
    });
