require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const USERNAME = 'admin';
const PASSWORD = 'Everest@123';

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await Admin.deleteMany({});
  await Admin.create({ username: USERNAME, password: PASSWORD });
  console.log(`✔ Admin seeded — username: ${USERNAME}  password: ${PASSWORD}`);
  process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
