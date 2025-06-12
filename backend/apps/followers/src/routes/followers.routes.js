const express = require('express');
// const { followUser, getFollowers, getFollowing } = require('./controllers');

const router = express.Router();

const followersController = require('../controllers/followers.controller');

router.post('/follow', followersController.followUser);
router.get('/followers/:userId', followersController.getFollowers);
router.get('/following/:followerId', followersController.getFollowing);

module.exports = router;
