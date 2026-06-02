const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const Note = require('../models/Note');
const auth = require('../middleware/auth');
const sendPush = require('../utils/push');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// GET all notes (with optional filters)
router.get('/', async (req, res) => {
  const filter = {};
  if (req.query.type) filter.type = req.query.type;
  if (req.query.class) filter.class = req.query.class;
  if (req.query.subject) filter.subject = req.query.subject;
  const notes = await Note.find(filter).sort({ chapterNumber: 1, createdAt: -1 });
  res.json(notes);
});

// POST create note (admin only)
router.post('/', auth, upload.single('file'), async (req, res) => {
  const note = new Note({
    ...req.body,
    fileUrl: req.file ? `/uploads/${req.file.filename}` : null,
    fileName: req.file ? req.file.originalname : null
  });
  await note.save();
  sendPush('New Material Published', `${note.type === 'note' ? 'Notes' : note.type === 'question' ? 'Questions' : 'Important Notes'}: ${note.title}`);
  res.status(201).json(note);
});

// DELETE note (admin only)
router.delete('/:id', auth, async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
