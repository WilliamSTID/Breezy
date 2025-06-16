// apps/authentification/src/index.js

const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
const verifyToken = require("./middlewares/auth.middlewares");

// Routes
const authCheckRoutes = require("./routes/authCheck.routes");
app.use("/api/authcheck", authCheckRoutes);

// Exemple de route protégée (utilise le middleware directement)
app.get("/api/protected", verifyToken, (req, res) => {
  res.json({ message: "✅ Accès autorisé", user: req.user });
});

// Route de santé
app.get("/", (req, res) => {
  res.send("🔐 Microservice authentification actif");
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`🚀 authentification lancé sur http://localhost:${PORT}`);
});