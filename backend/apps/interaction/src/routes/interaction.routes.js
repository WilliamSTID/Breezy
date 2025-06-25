const express = require('express');
const router = express.Router();
const controller = require('../controllers/interaction.controller');

router.post('/comment', controller.addComment); // commenter un post ou un commentaire
router.post('/comments/count', controller.countComments);
router.get('/comments/:postId', controller.getCommentsForPost);

router.post('/like', controller.toggleLike); // liker un post
router.post('/likes/count', controller.countLikes);
router.post('/query', controller.getUserLikesForPosts);

module.exports = router;