const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/breezy');

const authRoutes = require('./routes/auth');
app.use('/', authRoutes);

const PORT = process.env.PORT || 4004;
app.listen(PORT, () => {
  console.log(`userAccount service running on port ${PORT}`);
});