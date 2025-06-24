const express = require('express');
const router = express.Router();
const Follower = require('../models/Follower');

// Liste tous les followers (déjà présent)
router.get('/', async (req, res) => {
  const followers = await Follower.find();
  res.json(followers);
});

// Récupère les followers d'un userId
router.get('/follower/:userId', async (req, res) => {
  try {
    console.log(req.params.userId);
    const followers = await Follower.find({ user: req.params.userId });
    res.json(followers);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupère les utilisateurs suivis par un userId (following)
router.get('/following/:userId', async (req, res) => {
  try {
    const following = await Follower.find({ follower: req.params.userId });
    res.json(following);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Suivre un utilisateur
router.post('/follow', async (req, res) => {
  try {
    const { follower, followed } = req.body;
    if (!follower || !followed) return res.status(400).json({ error: 'Champs manquants' });

    // Vérifie si déjà suivi
    const exists = await Follower.findOne({ follower, followed });
    if (exists) return res.status(409).json({ error: 'Déjà suivi' });

    const follow = new Follower({ follower, followed });
    await follow.save();
    res.status(201).json(follow);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Ne plus suivre un utilisateur
router.delete('/unfollow', async (req, res) => {
  try {
    const { follower, followed } = req.body;
    if (!follower || !followed) return res.status(400).json({ error: 'Champs manquants' });

    const result = await Follower.findOneAndDelete({ follower, followed });
    if (!result) return res.status(404).json({ error: "Relation de suivi non trouvée" });

    res.json({ message: "Unfollow réussi" });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
