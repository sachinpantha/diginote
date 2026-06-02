const router = require('express').Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });
  if (!admin || !(await admin.comparePassword(password)))
    return res.status(400).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

// POST /api/auth/setup  (run once to create admin)
router.post('/setup', async (req, res) => {
  const exists = await Admin.findOne({});
  if (exists) return res.status(400).json({ message: 'Admin already exists' });
  const admin = new Admin({ username: req.body.username, password: req.body.password });
  await admin.save();
  res.json({ message: 'Admin created' });
});

module.exports = router;
