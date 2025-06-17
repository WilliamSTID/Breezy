// apps/authentification/src/index.js

const express = require('express');
require('dotenv').config();
const mongoose=require('mongoose');

const app = express();
const PORT = process.env.PORT || 4005;

// Middleware uniquement pour test ici
const verifyToken = require("./middlewares/auth.middlewares");

// Route protégée de test
app.get("/api/protected", verifyToken, (req, res) => {
  res.json({ message: "✅ Accès autorisé", user: req.user });
});
// MongoDB connection

mongoose
    .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/breezy')
    .then(() => {
      console.log("MongoDB connecté")
      app.listen(PORT, () => {
        console.log(`authentification service running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Erreur lors de la connexion à MongoDB :', err);
    })

// Route de santé
app.get("/", (req, res) => {
  res.send("🔐 Microservice authentification actif");
});

