const router = require('express').Router();
const Notice = require('../models/Notice');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  const notices = await Notice.find().sort({ createdAt: -1 });
  res.json(notices);
});

router.post('/', auth, async (req, res) => {
  const notice = new Notice(req.body);
  await notice.save();
  res.status(201).json(notice);
});

router.delete('/:id', auth, async (req, res) => {
  await Notice.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
