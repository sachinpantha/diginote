const router = require('express').Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const Note = require('../models/Note');
const auth = require('../middleware/auth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'digitnotes', resource_type: 'auto' }
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
    fileUrl: req.file ? req.file.path : null,
    fileName: req.file ? req.file.originalname : null,
    cloudinaryId: req.file ? req.file.filename : null
  });
  await note.save();
  res.status(201).json(note);
});

// DELETE note (admin only)
router.delete('/:id', auth, async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (note?.cloudinaryId) {
    await cloudinary.uploader.destroy(note.cloudinaryId, { resource_type: 'raw' }).catch(() => {});
  }
  await note.deleteOne();
  res.json({ message: 'Deleted' });
});

module.exports = router;
