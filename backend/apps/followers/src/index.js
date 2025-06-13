require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const followersRoutes = require('./routes/followers.routes');

const app = express();
const PORT = process.env.PORT || 4002;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/followers', followersRoutes);

mongoose
    .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/breezy')
    .then(() => {
      app.listen(PORT, () => {
        console.log(`followers service running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Erreur lors de la connexion à MongoDB :', err);
    });
