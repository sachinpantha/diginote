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
  params: (req, file) => ({
    folder: 'digitnotes',
    resource_type: file.mimetype === 'application/pdf' ? 'raw' : 'auto',
    format: file.mimetype === 'application/pdf' ? 'pdf' : undefined
  })
});
const upload = multer({ storage });

// Proxy file to bypass Cloudinary free-tier delivery restrictions
router.get('/file/:id', async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note?.fileUrl) return res.status(404).json({ message: 'File not found' });
  const axios = require('axios');
  try {
    const response = await axios.get(note.fileUrl, { responseType: 'stream' });
    res.setHeader('Content-Type', response.headers['content-type'] || 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${note.fileName || 'file.pdf'}"`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (response.headers['content-length']) res.setHeader('Content-Length', response.headers['content-length']);
    response.data.pipe(res);
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch file' });
  }
});

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
    const isRaw = note.fileUrl?.includes('/raw/upload/');
    await cloudinary.uploader.destroy(note.cloudinaryId, { resource_type: isRaw ? 'raw' : 'image' }).catch(() => {});
  }
  await note.deleteOne();
  res.json({ message: 'Deleted' });
});

module.exports = router;
