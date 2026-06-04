const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  important: { type: Boolean, default: false },
  class: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

noticeSchema.index({ class: 1, createdAt: -1 });

module.exports = mongoose.model('Notice', noticeSchema);
