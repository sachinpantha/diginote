const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title:         { type: String, required: true },
  chapter:       { type: String, required: true },
  chapterNumber: { type: Number, default: 0 },
  subject:       { type: String, required: true },
  class:         { type: String, required: true },
  description:   { type: String },
  ipfsHash:      { type: String, required: true }, // Pinata-pinned JSON of questions
  questionCount: { type: Number, default: 0 },
  createdAt:     { type: Date, default: Date.now }
});

quizSchema.index({ class: 1, subject: 1 });
module.exports = mongoose.model('Quiz', quizSchema);
