const mongoose = require('mongoose');
const { config } = require('../middlewares/secret');

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/ToysProject');
  console.log("connect mongo ToysProject local");
}