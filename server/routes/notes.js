const router = require('express').Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const Note = require('../models/Note');
const auth = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage() });

async function uploadToPinata(buffer, originalname) {
  const form = new FormData();
  form.append('file', buffer, { filename: originalname, contentType: 'application/pdf' });
  form.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));
  const { data } = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', form, {
    headers: { ...form.getHeaders(), Authorization: `Bearer ${process.env.PINATA_JWT}` }
  });
  return data.IpfsHash;
}

// Serve PDF via Pinata gateway
router.get('/file/:id', async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note?.fileUrl) return res.status(404).json({ message: 'File not found' });
  try {
    const response = await axios.get(note.fileUrl, { responseType: 'stream' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${note.fileName || 'file.pdf'}"`);
    response.data.pipe(res);
  } catch {
    res.status(500).json({ message: 'Failed to fetch file' });
  }
});

// GET all notes
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
  let fileUrl = null, fileName = null, ipfsHash = null;
  if (req.file) {
    ipfsHash = await uploadToPinata(req.file.buffer, req.file.originalname);
    fileUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    fileName = req.file.originalname;
  }
  const note = new Note({ ...req.body, fileUrl, fileName, ipfsHash });
  await note.save();
  res.status(201).json(note);
});

// DELETE note (admin only)
router.delete('/:id', auth, async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (note?.ipfsHash) {
    await axios.delete(`https://api.pinata.cloud/pinning/unpin/${note.ipfsHash}`, {
      headers: { Authorization: `Bearer ${process.env.PINATA_JWT}` }
    }).catch(() => {});
  }
  await note.deleteOne();
  res.json({ message: 'Deleted' });
});

module.exports = router;
