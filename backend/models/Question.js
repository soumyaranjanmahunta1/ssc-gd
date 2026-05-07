const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: [true, 'Question text is required'],
            trim: true,
        },
        options: {
            type: [String],
            required: [true, 'Options are required'],
            validate: {
                validator: v => v.length === 4,
                message: 'Exactly 4 options are required',
            },
        },
        answer: {
            type: String,
            required: [true, 'Answer is required'],
        },
        explanation: {
            type: String,
            default: '',
        },
        subject: {
            type: String,
            required: [true, 'Subject is required'],
            enum: ['GK', 'Math', 'Reasoning', 'English'],
        },
        difficulty: {
            type: String,
            enum: ['Easy', 'Medium', 'Hard'],
            default: 'Medium',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        mockTestNumber: {
            type: Number,
            required: true,
            min: 1,
        },
    },
    {
        timestamps: true,
    }
);

questionSchema.index({ mockTestNumber: 1, subject: 1 });
questionSchema.index({ subject: 1, difficulty: 1 });

module.exports = mongoose.model('Question', questionSchema);
