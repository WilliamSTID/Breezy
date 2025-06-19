const express = require('express');
const cors = require('cors');
const authService = require('./authService');

const app = express();
const PORT = process.env.PORT || 4005;

// Middlewares
app.use(cors());
app.use(express.json());

// Middleware d'authentification pour les routes protégées
const authMiddleware = (req, res, next) => {
  authService.authenticateToken(req, res, next);
};

// Routes protégées
app.get('/verify', authMiddleware, (req, res) => {
  res.status(200).json({ message: 'Token valide', user: req.user });
});

// Routes de base
app.get('/', (req, res) => {
  res.send('Service d\'authentification opérationnel');
});

// Routes d'authentification (non protégées)
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    
    if (!result.success) {
      return res.status(401).json({ message: result.message });
    }
    
    res.status(200).json(result.data);
  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

app.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    const result = await authService.register(email, password, username);
    
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }
    
    res.status(201).json(result.data);
  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Service d'authentification démarré sur le port ${PORT}`);
});