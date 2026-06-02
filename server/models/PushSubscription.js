const mongoose = require('mongoose');
const s = new mongoose.Schema({ subscription: { type: Object, required: true } });
module.exports = mongoose.model('PushSubscription', s);
