// apps/authentification/src/index.js

const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware uniquement pour test ici
const verifyToken = require("./middlewares/auth.middlewares");

// Route protégée de test
app.get("/api/protected", verifyToken, (req, res) => {
  res.json({ message: "✅ Accès autorisé", user: req.user });
});

// Route de santé
app.get("/", (req, res) => {
  res.send("🔐 Microservice authentification actif");
});

app.listen(PORT, () => {
  console.log(`🚀 authentification lancé sur http://localhost:${PORT}`);
});