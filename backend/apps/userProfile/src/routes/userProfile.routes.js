const express = require('express');
const authenticateToken = require('../middleware/authenticateToken');
const User = require('../models/User.js');
const userProfileController = require('../controllers/userProfile.controller.js');
const UserProfile = require('../models/UserProfile.js');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Route pour /profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    // Récupérer l'ID de l'utilisateur depuis le token JWT
    const userId = req.user.userId;
    
    // Chercher le profil utilisateur dans la base de données
    let userProfile = await UserProfile.findOne({ userId });
    
    // Si aucun profil n'existe, créer un profil par défaut
    if (!userProfile) {
      // Récupérer les informations de base de l'utilisateur
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      
      // Créer un profil par défaut
      userProfile = new UserProfile({
        userId: userId,
        username: user.username || `user_${userId.slice(-5)}`,
        displayName: user.username || `Utilisateur ${userId.slice(-5)}`
      });
      
      await userProfile.save();
    }
    
    // Retourner le profil
    res.json({
      success: true,
      profile: userProfile
    });
    
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Routes existantes
router.get('/profile/:userId/posts', userProfileController.getUserPosts);
router.put('/profile/:userId/posts/:postId', userProfileController.modifyUserPost)
router.post('/profile/:userId/posts', userProfileController.addUserPost);
router.get('/userprofiles', async (req, res) => {
  try {
    const profiles = await UserProfile.find();
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur." });
  }
});
router.get('/', authenticateToken, async (req, res) => {
  try {
    const users = await User.find({}, { username: 1, _id: 0 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// Ajouter cette route pour déboguer les variables d'environnement et le token
router.get('/env-debug', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  const envInfo = {
    hasJwtSecret: !!process.env.JWT_SECRET,
    jwtSecretFirstChars: process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 3) + '...' : 'non défini',
    mongoUri: process.env.MONGO_URI ? 'défini' : 'non défini',
    nodeEnv: process.env.NODE_ENV,
    tokenProvided: !!token
  };
  
  if (token) {
    try {
      // Décodage sans vérification pour voir la structure
      const decoded = jwt.decode(token);
      envInfo.decodedToken = decoded;
      
      // Tentative de vérification
      jwt.verify(token, process.env.JWT_SECRET, (err, verified) => {
        if (err) {
          envInfo.verificationError = err.message;
        } else {
          envInfo.tokenVerified = true;
        }
        res.json(envInfo);
      });
    } catch (error) {
      envInfo.error = error.message;
      res.json(envInfo);
    }
  } else {
    res.json(envInfo);
  }
});

// Ajouter cette route de diagnostic qui n'utilise pas le middleware d'authentification
router.get('/auth-debug', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET;
  
  // Information de base
  const debugInfo = {
    hasAuthHeader: !!authHeader,
    hasToken: !!token,
    hasSecret: !!secret,
    secretFirstChars: secret ? secret.substring(0, 3) + '...' : 'non défini',
  };
  
  // Si un token est fourni, essayez de le décoder
  if (token) {
    try {
      // Décodage sans vérification
      const decodedToken = jwt.decode(token);
      debugInfo.decodedToken = decodedToken;
      
      // Tentative de vérification avec le secret
      if (secret) {
        try {
          const verifiedToken = jwt.verify(token, secret);
          debugInfo.verificationStatus = "Succès";
          debugInfo.verifiedToken = verifiedToken;
        } catch (verifyError) {
          debugInfo.verificationStatus = "Échec";
          debugInfo.verificationError = verifyError.message;
        }
      }
    } catch (decodeError) {
      debugInfo.decodeError = decodeError.message;
    }
  }
  
  res.json(debugInfo);
});

// Ajouter cette route pour déboguer le secret JWT
router.get('/debug-secret', (req, res) => {
  // Attention: ne jamais exposer le secret complet en production
  // Ceci est uniquement à des fins de débogage
  res.json({ 
    jwtSecretFirstChars: process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 5) + '...' : 'non défini',
    envVars: Object.keys(process.env).filter(key => !key.includes("PATH"))
  });
});

module.exports = router;
