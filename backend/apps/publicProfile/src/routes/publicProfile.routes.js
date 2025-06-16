const express = require('express');
const router = express.Router();
const pulbicProfileController = require('../controllers/publicProfile.controller.js');
const User = require('../models/User');

router.get('/profile/:username', pulbicProfileController.getUserAccountInformation);
router.get('/publicprofiles', async (req, res) => {
  try {
    const profiles = await User.find();
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router; 
