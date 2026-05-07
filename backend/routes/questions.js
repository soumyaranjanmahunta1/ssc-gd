const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// ─── GET /api/questions ───────────────────────────────────────────────────────
// Query params: subject, limit, page, difficulty
router.get('/', async (req, res) => {
    try {
        const { subject, limit = 20, page = 1, difficulty } = req.query;

        const filter = { isActive: true };
        if (subject && ['GK', 'Math', 'Reasoning', 'English'].includes(subject)) {
            filter.subject = subject;
        }
        if (difficulty && ['Easy', 'Medium', 'Hard'].includes(difficulty)) {
            filter.difficulty = difficulty;
        }

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        const [questions, total] = await Promise.all([
            Question.find(filter)
                .select('-__v -isActive -createdAt -updatedAt')
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Question.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: questions,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
                hasNext: pageNum < Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error('GET /questions error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch questions' });
    }
});

// ─── GET /api/questions/mock-tests ─────────────────────────────────────────────
// Returns list of available mock test numbers with question counts
router.get('/mock-tests', async (req, res) => {
    try {
        const tests = await Question.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$mockTestNumber', count: { $sum: 1 } } },
            { $match: { count: { $gte: 80 } } },
            { $sort: { _id: 1 } },
        ]);

        res.json({
            success: true,
            data: tests.map(t => ({ number: t._id, questionCount: t.count })),
        });
    } catch (error) {
        console.error('GET /mock-tests error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch mock tests' });
    }
});

// ─── GET /api/questions/mock-test/:number ──────────────────────────────────────
// Returns exactly 80 questions for a specific mock test number
router.get('/mock-test/:number', async (req, res) => {
    try {
        const number = parseInt(req.params.number);
        if (isNaN(number) || number < 1) {
            return res.status(400).json({ success: false, message: 'Invalid mock test number' });
        }

        const questions = await Question.find({ mockTestNumber: number, isActive: true })
            .select('-__v -isActive -createdAt -updatedAt -mockTestNumber')
            .lean();

        if (questions.length < 80) {
            return res.status(404).json({ success: false, message: 'Mock test not found or incomplete' });
        }

        const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, 80);
        res.json({ success: true, data: shuffled, total: shuffled.length });
    } catch (error) {
        console.error('GET /mock-test/:number error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch mock test' });
    }
});

// ─── POST /api/questions/submit-test ─────────────────────────────────────────
router.post('/submit-test', async (req, res) => {
    try {
        const { uid, subject, score, correct, wrong, skipped, timeTaken, answers } = req.body;

        if (!uid || score === undefined || correct === undefined) {
            return res.status(400).json({
                success: false,
                message: 'uid, score, and correct fields are required',
            });
        }

        // Result storage is primarily handled by Firestore on the app side.
        // This endpoint just acknowledges the submission and can be extended.
        res.json({
            success: true,
            message: 'Test submitted successfully',
            data: {
                uid,
                subject: subject || 'Mixed',
                score,
                correct,
                wrong: wrong || 0,
                skipped: skipped || 0,
                timeTaken: timeTaken || 0,
                submittedAt: new Date(),
            },
        });
    } catch (error) {
        console.error('POST /submit-test error:', error);
        res.status(500).json({ success: false, message: 'Failed to submit test' });
    }
});

// ─── GET /api/questions/:id ───────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
    try {
        const question = await Question.findById(req.params.id).lean();
        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }
        res.json({ success: true, data: question });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch question' });
    }
});

module.exports = router;
