const express = require('express');
// const { followUser, getFollowers, getFollowing } = require('./controllers');

const router = express.Router();

const interactionController = require('../controllers/interaction.controller');

router.post('/follow', interactionController.followUser);
router.get('/followers/:userId', interactionController.getFollowers);
router.get('/following/:followerId', interactionController.getFollowing);

module.exports = router;
