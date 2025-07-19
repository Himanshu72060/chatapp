const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// POST a message
router.post('/', async (req, res) => {
    try {
        const message = await Message.create(req.body);
        res.status(201).json(message);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET all messages between two users
router.get('/', async (req, res) => {
    const { sender, receiver } = req.query;
    try {
        const messages = await Message.find({
            $or: [
                { sender, receiver },
                { sender: receiver, receiver: sender }
            ]
        }).sort('timestamp');
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
