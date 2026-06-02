const router = require('express').Router();
const PushSubscription = require('../models/PushSubscription');

router.get('/vapid-public-key', (req, res) => {
  res.json({ key: process.env.VAPID_PUBLIC_KEY });
});

router.post('/subscribe', async (req, res) => {
  const { subscription } = req.body;
  const exists = await PushSubscription.findOne({ 'subscription.endpoint': subscription.endpoint });
  if (!exists) await PushSubscription.create({ subscription });
  res.json({ message: 'Subscribed' });
});

module.exports = router;
