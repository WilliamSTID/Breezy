const express = require("express");
const { setPosts, getPosts, editPost, deletePost } = require("../controllers/post.controllers");
const router = express.Router();
const Post = require('../models/post.models');

// Récupérer tous les posts d'un utilisateur
router.get('/user/:userId', async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération des posts." });
  }
});

//Création des API CRUD
router.get("/", getPosts);
router.post("/", setPosts);
router.put("/:id", editPost);
router.delete("/:id", deletePost);

module.exports = router;

