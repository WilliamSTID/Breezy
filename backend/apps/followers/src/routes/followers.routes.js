const express = require('express');
// const { followUser, getFollowers, getFollowing } = require('./controllers');

const router = express.Router();

const followersController = require('../controllers/followers.controller');
require('../models/User'); // Ajoute ceci en haut du fichier

router.post('/', followersController.followUser);
router.get('/followers/:userId', followersController.getFollowers);
router.get('/following/:followerId', followersController.getFollowing);
router.get('/', async (req, res) => {
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

module.exports = router;
