const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// Create message
router.post("/", async (req, res) => {
    try {
        const message = new Message(req.body);
        await message.save();
        res.status(201).json(message);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all messages
router.get("/", async (req, res) => {
    try {
        const messages = await Message.find().sort({ timestamp: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get chat between two users
router.get("/chat", async (req, res) => {
    const { user1, user2 } = req.query;
    try {
        const chats = await Message.find({
            $or: [
                { sender: user1, receiver: user2 },
                { sender: user2, receiver: user1 }
            ]
        }).sort({ timestamp: 1 });
        res.json(chats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update message
router.put("/:id", async (req, res) => {
    try {
        const updated = await Message.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete message
router.delete("/:id", async (req, res) => {
    try {
        await Message.findByIdAndDelete(req.params.id);
        res.json({ message: "Message deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
