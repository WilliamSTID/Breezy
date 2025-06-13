const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/breezy');

app.use('/auth', require('./src/routes/auth'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`userAccount service running on port ${PORT}`);
});