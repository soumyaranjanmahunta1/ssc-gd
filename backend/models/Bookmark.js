const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    createdAt: { type: Date, default: Date.now },
});

bookmarkSchema.index({ email: 1, questionId: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
