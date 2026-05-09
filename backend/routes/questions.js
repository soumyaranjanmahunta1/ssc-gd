const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

const SUBJECTS = ['Math', 'Reasoning', 'GK', 'English', 'Hindi'];

// GET /api/questions/chapters
// Returns chapters grouped by subject
router.get('/chapters', async (req, res) => {
    try {
        const results = await Question.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: { subject: '$subject', chapter: '$chapter' }, count: { $sum: 1 } } },
            { $sort: { '_id.subject': 1, '_id.chapter': 1 } },
        ]);
        const grouped = {};
        for (const r of results) {
            const { subject, chapter } = r._id;
            if (!grouped[subject]) grouped[subject] = [];
            grouped[subject].push({ chapter, count: r.count });
        }
        res.json({ success: true, data: grouped });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch chapters' });
    }
});

// GET /api/questions/mock-test?optionalSubject=Hindi
// Returns 80 questions: 20 each from Math, Reasoning, GK + optionalSubject (Hindi or English)
router.get('/mock-test', async (req, res) => {
    try {
        const { optionalSubject } = req.query;
        if (!['Hindi', 'English'].includes(optionalSubject)) {
            return res.status(400).json({ success: false, message: 'optionalSubject must be Hindi or English' });
        }
        const subjects = ['Math', 'Reasoning', 'GK', optionalSubject];
        const sections = await Promise.all(
            subjects.map(subject =>
                Question.aggregate([
                    { $match: { subject, isActive: true } },
                    { $sample: { size: 20 } },
                    { $project: { __v: 0, isActive: 0, createdAt: 0, updatedAt: 0 } },
                ])
            )
        );
        const questions = sections.flat();
        res.json({ success: true, data: questions, subjects });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch mock test' });
    }
});

// GET /api/questions/chapter-test?subject=Math&chapter=Percentage
// Returns 10 questions for a specific chapter
router.get('/chapter-test', async (req, res) => {
    try {
        const { subject, chapter } = req.query;
        if (!subject || !chapter) {
            return res.status(400).json({ success: false, message: 'subject and chapter required' });
        }
        const questions = await Question.aggregate([
            { $match: { subject, chapter, isActive: true } },
            { $sample: { size: 10 } },
            { $project: { __v: 0, isActive: 0, createdAt: 0, updatedAt: 0 } },
        ]);
        res.json({ success: true, data: questions });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch chapter test' });
    }
});

// GET /api/questions?subject=Math&limit=25
// Topic-wise test (existing behaviour)
router.get('/', async (req, res) => {
    try {
        const { subject, limit = 25, difficulty } = req.query;
        const filter = { isActive: true };
        if (subject && SUBJECTS.includes(subject)) filter.subject = subject;
        if (difficulty && ['Easy', 'Medium', 'Hard'].includes(difficulty)) filter.difficulty = difficulty;

        const questions = await Question.aggregate([
            { $match: filter },
            { $sample: { size: Math.min(50, parseInt(limit)) } },
            { $project: { __v: 0, isActive: 0, createdAt: 0, updatedAt: 0 } },
        ]);
        res.json({ success: true, data: questions, total: questions.length });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch questions' });
    }
});

module.exports = router;
