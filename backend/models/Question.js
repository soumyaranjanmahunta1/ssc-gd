const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: { type: String, required: true, trim: true },
    options: {
        type: [String],
        required: true,
        validate: { validator: v => v.length === 4, message: 'Exactly 4 options required' },
    },
    answer: { type: String, required: true },
    explanation: { type: String, default: '' },
    subject: {
        type: String,
        required: true,
        enum: ['GK', 'Math', 'Reasoning', 'English', 'Hindi'],
    },
    chapter: { type: String, required: true, trim: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

questionSchema.index({ subject: 1, chapter: 1 });
questionSchema.index({ subject: 1, difficulty: 1 });

module.exports = mongoose.model('Question', questionSchema);
