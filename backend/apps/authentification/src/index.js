// src/index.js

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// App setup
const app = express();
const PORT = process.env.PORT || 4005;

// Middlewares
app.use(cors());
app.use(express.json());
const authRoutes = require("./routes/auth.routes.js");
app.use("/api/auth", authRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connecté"))
  .catch((err) => console.error("Erreur MongoDB :", err));

// Test route
app.get("/", (req, res) => {
  res.send("Breezy API is running 🌀");
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});