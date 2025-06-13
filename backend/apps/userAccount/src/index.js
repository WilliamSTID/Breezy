// apps/userAccount/src/index.js

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./routes/auth.routes");
app.use("/api/auth", authRoutes);

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connecté (userAccount)"))
  .catch((err) => console.error("❌ Erreur MongoDB :", err));

// Route de test
app.get("/", (req, res) => {
  res.send("🧩 Microservice userAccount en ligne");
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`🚀 userAccount lancé sur http://localhost:${PORT}`);
});