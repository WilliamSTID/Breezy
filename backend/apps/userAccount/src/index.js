const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 4004;

app.use(cors());
app.use(express.json());

// Renommer la route pour éviter la confusion
app.use('/', authRoutes);

mongoose.connect('mongodb://breezy-mongo:27017/breezy')
  .then(() => console.log('MongoDB connecté'))
  .catch(err => console.error('MongoDB connexion error:', err));

app.listen(PORT, () => {
  console.log(`userAccount service running on port ${PORT}`);
});