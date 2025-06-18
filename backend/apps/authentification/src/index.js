require('./libs/loadEnv')();

const express  = require('express');
const mongoose = require('mongoose');
const verifyToken = require('./middlewares/auth.middlewares');

const app = express();
const PORT = process.env.PORT || 4005;

app.use(express.json());

// Route de santé
app.get('/', (req, res) => {
    res.send('🔐 Microservice authentification actif');
});

// Route protégée pour test
app.get('/api/protected', verifyToken, (req, res) => {
    res.json({ message: 'Accès autorisé', user: req.user });
});

app.get('/api/token', (req, res) => {
    res.json({ message: process.env.JWT_SECRET});
});

// Connexion à MongoDB
mongoose
    .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/breezy')
    .then(() => {
        console.log('MongoDB connecté');
        app.listen(PORT, () => {
            console.log(`Microservice authentification en écoute sur le port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Erreur MongoDB :', err.message);
    });
