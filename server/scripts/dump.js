require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await Admin.deleteMany({});
  console.log('✔ Admins collection dumped');
  process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
