const express = require('express');
const mongoose = require('mongoose');
const userprofileRoutes = require('./routes/userProfile.routes');
require('dotenv').config();


const app = express();
app.use(express.json());

app.use('/userprofile', userprofileRoutes);

const PORT = process.env.PORT || 4003;


mongoose
    .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/breezy')
    .then(() => {
      app.listen(PORT, () => {
        console.log(`userProfile service running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Erreur lors de la connexion à MongoDB :', err);
    });
