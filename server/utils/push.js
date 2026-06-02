const webpush = require('web-push');
const PushSubscription = require('../models/PushSubscription');

webpush.setVapidDetails(
  process.env.VAPID_EMAIL || 'mailto:admin@everestdiginotes.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

async function sendPush(title, body) {
  const docs = await PushSubscription.find();
  const payload = JSON.stringify({ title, body });
  await Promise.allSettled(
    docs.map(doc =>
      webpush.sendNotification(doc.subscription, payload).catch(async err => {
        if (err.statusCode === 410) await doc.deleteOne();
      })
    )
  );
}

module.exports = sendPush;
