const express = require('express');
const router = express.Router();
const Bookmark = require('../models/Bookmark');

// POST /api/bookmarks/toggle
// body: { email, questionId }
// Adds bookmark if not exists, removes if exists. Returns { bookmarked: true/false }
router.post('/toggle', async (req, res) => {
    try {
        const { email, questionId } = req.body;
        if (!email || !questionId) {
            return res.status(400).json({ success: false, message: 'Email and questionId are required.' });
        }

        const key = { email: email.toLowerCase().trim(), questionId };
        const existing = await Bookmark.findOne(key);

        if (existing) {
            await Bookmark.deleteOne({ _id: existing._id });
            return res.json({ success: true, bookmarked: false });
        } else {
            await Bookmark.create(key);
            return res.json({ success: true, bookmarked: true });
        }
    } catch (err) {
        console.error('bookmark toggle error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// GET /api/bookmarks?email=user@example.com
// Returns all bookmarked questions (populated) for the given user
router.get('/', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required.' });
        }

        const bookmarks = await Bookmark.find({ email: email.toLowerCase().trim() })
            .populate('questionId')
            .sort({ createdAt: -1 });

        const data = bookmarks.map(b => b.questionId).filter(Boolean);
        res.json({ success: true, data });
    } catch (err) {
        console.error('get bookmarks error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
