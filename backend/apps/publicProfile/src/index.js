const express = require('express');
const mongoose = require('mongoose');
const publicProfileRoutes = require('./routes/publicProfile.routes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', publicProfileRoutes);

mongoose
    .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/breezy')
    .then(() => {
      app.listen(PORT, () => {
        console.log(`publicProfile service running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Erreur lors de la connexion à MongoDB :', err);
    });