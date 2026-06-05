const router = require('express').Router();
const axios  = require('axios');
const Quiz   = require('../models/Quiz');
const auth   = require('../middleware/auth');

const PINATA_JWT = () => process.env.PINATA_JWT;

async function pinJSON(obj) {
  const { data } = await axios.post(
    'https://api.pinata.cloud/pinning/pinJSONToIPFS',
    { pinataContent: obj, pinataOptions: { cidVersion: 1 } },
    { headers: { Authorization: `Bearer ${PINATA_JWT()}`, 'Content-Type': 'application/json' } }
  );
  return data.IpfsHash;
}

async function fetchQuestions(ipfsHash) {
  const { data } = await axios.get(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`, { timeout: 10000 });
  return data;
}

// GET /api/quiz — list modules
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.class)   filter.class   = req.query.class;
    if (req.query.subject) filter.subject = req.query.subject;
    const modules = await Quiz.find(filter).sort({ chapterNumber: 1, createdAt: -1 });
    res.json(modules);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/quiz/:id/questions — fetch questions from Pinata
router.get('/:id/questions', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Not found' });
    const questions = await fetchQuestions(quiz.ipfsHash);
    res.json(questions);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/quiz — create module with questions (admin only)
// Body: { title, chapter, chapterNumber, subject, class, description, questions: [...] }
router.post('/', auth, async (req, res) => {
  try {
    const { questions, ...meta } = req.body;
    if (!questions || !questions.length)
      return res.status(400).json({ message: 'At least one question required' });

    const ipfsHash = await pinJSON(questions);
    const quiz = await Quiz.create({ ...meta, ipfsHash, questionCount: questions.length });
    res.status(201).json(quiz);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/quiz/:id — update module meta + questions (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Not found' });
    const { questions, ...meta } = req.body;
    if (!questions || !questions.length)
      return res.status(400).json({ message: 'At least one question required' });
    // Unpin old, pin new
    await axios.delete(`https://api.pinata.cloud/pinning/unpin/${quiz.ipfsHash}`, {
      headers: { Authorization: `Bearer ${PINATA_JWT()}` }
    }).catch(() => {});
    const ipfsHash = await pinJSON(questions);
    const updated = await Quiz.findByIdAndUpdate(
      req.params.id,
      { ...meta, ipfsHash, questionCount: questions.length },
      { new: true }
    );
    res.json(updated);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// DELETE /api/quiz/:id (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Not found' });
    await axios.delete(`https://api.pinata.cloud/pinning/unpin/${quiz.ipfsHash}`, {
      headers: { Authorization: `Bearer ${PINATA_JWT()}` }
    }).catch(() => {});
    await quiz.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
