require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const followersRoutes = require('./routes/followers.routes');
const userRoutes = require('./routes/user.routes');

const app = express();
const PORT = process.env.PORT || 4002;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/followers', followersRoutes);
app.use('/api/users', userRoutes);

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Service running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Erreur lors de la connexion à MongoDB :', err);
    });
