const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const axios = require('axios')

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentification requise' });
    }
    
    // Vérifier le token auprès du service d'authentification
    try {
      const response = await axios.post('http://authentification:4005/auth/verify', { token });
      
      if (response.data && response.data.valid) {
        req.user = response.data.user;
        next();
      } else {
        return res.status(403).json({ message: 'Token invalide' });
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error.message);
      return res.status(500).json({ message: 'Erreur serveur lors de l\'authentification' });
    }
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};
// Cette route est maintenant appelée en interne par le service d'authentification
// et non directement par les clients
router.post('/internal/create-user', async (req, res) => {
  try {
    const { userId, username, email } = req.body;
    
    // Vérifier si la requête vient du service d'authentification
    // Dans un environnement de production, on utiliserait une authentification plus robuste
    // comme des clés API internes ou des JWT spécifiques aux services
    
    const user = new User({ 
      _id: userId,  // Utiliser l'ID généré par le service d'authentification
      username, 
      email,
      // Ne stocke plus le mot de passe ici
    });
    
    await user.save();
    res.json({ message: 'Utilisateur créé', userId: user._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Route pour obtenir des informations d'un utilisateur spécifique
router.get('/users/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour mettre à jour un utilisateur
router.put('/users/:id', authenticateToken, async (req, res) => {
  try {
    // Vérifier que l'utilisateur modifie son propre compte
    if (req.user.userId !== req.params.id) {
      return res.status(403).json({ error: 'Non autorisé' });
    }
    
    const { username, email } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { username, email },
      { new: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Conserver la route pour lister les utilisateurs
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;