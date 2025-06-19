const express = require('express');
const authenticateToken = require('../../../libs/auth/authenticateToken');
const pulbicProfileController = require('../controllers/publicProfile.controller.js');
const User = require('../models/User');
const router = express.Router();

router.get('/profile/:username', pulbicProfileController.getUserAccountInformation);
router.get('/publicprofiles', async (req, res) => {
  try {
    const profiles = await User.find();
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
router.get('/', authenticateToken, async (req, res) => {
  const users = await User.find({}, { username: 1, _id: 0 });
  res.json(users);
});

module.exports = router;
