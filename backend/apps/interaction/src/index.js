require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes/interaction.routes.js');

const app = express();
const PORT = process.env.PORT || 4002;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', routes);

mongoose
    .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/interaction')
    .then(() => {
        app.listen(PORT, () => {
            console.log(`interaction service running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Erreur lors de la connexion à MongoDB :', err);
    });
