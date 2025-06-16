const express = require('express');
const router = express.Router();
const controller = require('../controllers/interaction.controller');

router.post('/comment', controller.addComment); // commenter un post ou un commentaire
router.post('/like', controller.likePost); // liker un post

module.exports = router;