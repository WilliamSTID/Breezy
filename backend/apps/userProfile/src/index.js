const express = require('express');
const mongoose = require('mongoose');
const userProfileRoutes = require('./routes/userProfile.routes');


const app = express();
app.use(express.json());

app.use('/userprofile', userProfileRoutes);

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
