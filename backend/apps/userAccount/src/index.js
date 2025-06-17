const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 4004;

const authRoutes = require('./routes/auth');
app.use('/', authRoutes);

 
// Middleware
app.use(express.json());
app.use(cors());

// Route de test
app.get("/", (req, res) => {
  res.send("🧩 Microservice userAccount en ligne");
});
  
mongoose
    .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/breezy')
    .then(() => {
      app.listen(PORT, () => {
        console.log(`userAccount service running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Erreur lors de la connexion à MongoDB :', err);
    });