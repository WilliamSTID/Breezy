const express = require('express');
const authenticateToken = require('../../libs/auth/authenticateToken');
const User = require('../models/User');
const followersController = require('../controllers/followers.controller');
require('../models/User'); // Ajoute ceci en haut du fichier

const router = express.Router();

router.post('/', followersController.followUser);
router.get('/followers/:userId', followersController.getFollowers);
router.get('/following/:followerId', followersController.getFollowing);
router.get('/', authenticateToken, async (req, res) => {
  console.log('GET /followers called');
  try {
    const Follower = require('../models/Follower');
    const followers = await Follower.find()
      .populate('user', 'username avatar')
      .populate('follower', 'username avatar');
    res.json(followers);
  } catch (err) {
    console.error(err); // ← ce log doit apparaître en cas d’erreur
    res.status(500).json({ message: "Erreur serveur." });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  const users = await User.find({}, { username: 1, _id: 0 });
  res.json(users);
});

module.exports = router;
