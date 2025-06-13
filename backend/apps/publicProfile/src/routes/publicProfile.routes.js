const express = require('express');

const router = express.Router();

const pulbicProfileController = require('../controllers/publicProfile.controller.js');

router.get('/profile/:username', pulbicProfileController.getUserAccountInformation);

module.exports = router;
