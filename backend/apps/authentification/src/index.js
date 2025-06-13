const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// App setup
const app = express();
const PORT = process.env.PORT || 5050;

// Middlewares
app.use(cors());
app.use(express.json());
const authRoutes = require("./routes/auth.routes.js");
app.use("/api/auth", authRoutes);

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

// Test route
app.get("/", (req, res) => {
  res.send("Breezy API is running 🌀");
});
