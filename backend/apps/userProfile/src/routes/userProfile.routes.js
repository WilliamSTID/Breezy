const express = require('express');

const router = express.Router();

const userProfileController = require('../controllers/userProfile.controller.js');

router.get('/profile/:userId/posts', userProfileController.getUserPosts);
router.put('/profile/:userId/posts/:postId', userProfileController.modifyUserPost)
router.post('/profile/:userId/posts', userProfileController.addUserPost);

module.exports = router;
