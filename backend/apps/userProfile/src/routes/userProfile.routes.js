const express = require('express');

const router = express.Router();

const userProfileController = require('../controllers/userProfile.controller.js');
const UserProfile = require('../models/UserProfile'); // adapte le nom si besoin

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

module.exports = router;
