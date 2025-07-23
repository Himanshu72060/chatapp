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
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const Message = require("./models/Message"); // ✅ your correct model import
const router = require("./routes/messageRoutes");

app.use(cors());
app.use(express.json());
app.use("/api/messages", router);

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.error("MongoDB Error:", err));

// ✅ SOCKET.IO Handling
io.on("connection", (socket) => {
    console.log("🟢 Client connected:", socket.id);

    socket.on("sendMessage", async (data) => {
        const { sender, receiver, message } = data;
        console.log("📨 Received:", data);

        try {
            const newMessage = new Message({
                sender,
                receiver,
                message,
                timestamp: new Date()
            });
            await newMessage.save();
            console.log("✅ Message saved to MongoDB");

            // Broadcast message
            socket.broadcast.emit("receiveMessage", data);
        } catch (error) {
            console.error("❌ Error saving message:", error);
        }
    });

    socket.on("disconnect", () => {
        console.log("🔴 Client disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
});
