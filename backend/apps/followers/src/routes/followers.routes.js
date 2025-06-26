const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Follower = require('../models/Follower');

// 🔒 Middleware d'authentification
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token manquant" });

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch {
    return res.status(403).json({ error: "Token invalide" });
  }
};

// ✅ Vérifie si je suis un utilisateur
router.get('/following/:userId', authenticate, async (req, res) => {
  try {
    const existing = await Follower.findOne({
      follower: req.user.id,
      user: req.params.userId,
    });

    res.json({ isFollowing: !!existing });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/following', authenticate, async (req, res) => {
  try {
    const following = await Follower.find({ follower: req.user.id });
    res.json(following);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ✅ Suivre un utilisateur
router.post('/follow/:userId', authenticate, async (req, res) => {
  try {
    const follower = req.user.id;
    const user = req.params.userId;

    if (follower === user) return res.status(400).json({ error: "Impossible de se suivre soi-même" });

    const exists = await Follower.findOne({ follower, user });
    if (exists) return res.status(409).json({ error: "Déjà suivi" });

    const follow = new Follower({ follower, user });
    await follow.save();

    res.status(201).json(follow);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur', details: err });
  }
});

// ✅ Ne plus suivre un utilisateur
// router.delete('/unfollow/:follower/:followed', async (req, res) => {
//   try {
//     const { follower, followed } = req.params;
//
//     const result = await Follower.findOneAndDelete({ follower, user: followed });
//     if (!result) return res.status(404).json({ error: "Relation de suivi non trouvée" });
//
//     res.json({ message: "Unfollow réussi" });
//   } catch (err) {
//     res.status(500).json({ error: 'Erreur serveur' });
//   }
// });
router.delete('/unfollow/:followed', authenticate, async (req, res) => {
  try {
    const follower = req.user.id;
    const followed = req.params.followed;

    if (follower === followed) {
      return res.status(400).json({ error: "Impossible de se désabonner de soi-même" });
    }

    const result = await Follower.findOneAndDelete({ follower, user: followed });
    if (!result) {
      return res.status(404).json({ error: "Relation de suivi non trouvée" });
    }

    res.json({ message: "Unfollow réussi" });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});


// Optionnels : anciens endpoints d'inspection (conservation possible)
router.get('/', async (req, res) => {
  const followers = await Follower.find();
  res.json(followers);
});

router.get('/follower/:userId', async (req, res) => {
  try {
    const followers = await Follower.find({ user: req.params.userId });
    res.json(followers);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/following-list/:userId', async (req, res) => {
  try {
    const following = await Follower.find({ follower: req.params.userId });
    res.json(following);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
