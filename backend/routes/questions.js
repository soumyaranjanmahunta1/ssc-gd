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

// ─── GET /api/questions/mock-test ──────────────────────────────────────────────
// Returns exactly 80 questions (20 from each: GK, Math, Reasoning, English)
router.get('/mock-test', async (req, res) => {
    try {
        const subjects = ['GK', 'Math', 'Reasoning', 'English'];
        
        // Use MongoDB aggregation to sample 20 random questions per subject
        const questionPromises = subjects.map(subject => 
            Question.aggregate([
                { $match: { subject, isActive: true } },
                { $sample: { size: 20 } },
                { $project: { __v: 0, isActive: 0, createdAt: 0, updatedAt: 0 } }
            ])
        );

        const results = await Promise.all(questionPromises);
        
        // Flatten and shuffle the final list
        const allQuestions = results.flat();
        const shuffled = allQuestions.sort(() => Math.random() - 0.5);

        res.json({
            success: true,
            data: shuffled,
            total: shuffled.length
        });
    } catch (error) {
        console.error('GET /mock-test error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate mock test' });
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
