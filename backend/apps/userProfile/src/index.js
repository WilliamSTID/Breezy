// Charger les variables d'environnement au tout début
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const userProfileRoutes = require('./routes/userProfile.routes');

// Vérification des variables d'environnement au démarrage
console.log("JWT_SECRET défini:", !!process.env.JWT_SECRET);
console.log("MONGO_URI défini:", !!process.env.MONGO_URI);

const app = express();

app.use(express.json());
app.use('/', userProfileRoutes);

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('MongoDB connecté');
  app.listen(4003, () => {
    console.log('userProfile service running on port 4003');
  });
})
.catch(err => {
  console.error('Erreur de connexion MongoDB', err);
});
