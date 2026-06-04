const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  chapter: { type: String, required: true },
  chapterNumber: { type: Number, default: 0 },
  subject: { type: String, required: true },
  class: { type: String, required: true },
  content: { type: String },
  fileUrl: { type: String },
  fileName: { type: String },
  ipfsHash: { type: String },
  type: { type: String, enum: ['note', 'question', 'important'], default: 'note' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Note', noteSchema);
