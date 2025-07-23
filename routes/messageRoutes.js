const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// POST a message
router.post('/', async (req, res) => {
    try {
        const newMessage = new Message(req.body);
        const savedMessage = await newMessage.save();
        res.status(201).json(savedMessage);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET all messages between two users
router.get('/:sender/:receiver', async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { sender: req.params.sender, receiver: req.params.receiver },
                { sender: req.params.receiver, receiver: req.params.sender }
            ]
        }).sort({ timestamp: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE a message
router.put('/:id', async (req, res) => {
    try {
        const updated = await Message.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE a message
router.delete('/:id', async (req, res) => {
    try {
        await Message.findByIdAndDelete(req.params.id);
        res.json({ message: 'Message deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
