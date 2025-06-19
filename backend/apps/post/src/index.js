const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const authenticateToken = require('../libs/auth/authenticateToken');
const userRoutes = require('./routes/user.routes');
dotenv.config();
const app = express();
const PORT = process.env.PORT || 4006;

// Application des middlewares
app.use(authenticateToken);
app.use(express.json());

//spécification des routes à aller récupérer
app.use('/posts', require('./routes/post.routes'));
app.use('/api/users', userRoutes);

//connexion avec la BDD mongoD via la bibliothèque Mongoose
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`post service running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Erreur lors de la connexion à MongoDB :', err);
  });