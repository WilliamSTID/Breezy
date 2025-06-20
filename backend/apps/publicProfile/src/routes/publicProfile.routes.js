const express = require('express');
const router = express.Router();
const pulbicProfileController = require('../controllers/publicProfile.controller.js');
const User = require('../models/User');
const Post = require('../models/post.models');

router.get('/profile/:username', pulbicProfileController.getUserAccountInformation);
router.get('/publicprofiles', async (req, res) => {
  try {
    const profiles = await User.find();
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer le profil public par userId
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('username bio avatar');
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer les posts d'un utilisateur
router.get('/:userId/post.models', async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
