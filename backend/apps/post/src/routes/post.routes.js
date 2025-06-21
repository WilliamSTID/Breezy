const express = require("express");
const postController = require('../controllers/post.controllers');
const router = express.Router();
const Post = require('../models/post.models');

// Récupérer tous les posts d'un utilisateur
router.get('/user/:userId', postController.getPostsByUser);

//Création des API CRUD
router.get("/", postController.getPosts);
router.post("/", postController.setPosts);
router.put("/:id", postController.editPost);
router.delete("/:id", postController.deletePost);

module.exports = router;

