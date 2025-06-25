const express = require("express");
const postController = require('../controllers/post.controllers');
const router = express.Router();
const mongoose = require("mongoose");

const Post = require('../models/Post');

// Récupérer tous les posts d'un utilisateur
// router.get('/user/:userId', postController.getPostsByUser);

//Création des API CRUD
router.get("/", postController.getPosts);
router.post("/", postController.setPosts);
router.put("/:id", postController.editPost);
router.delete("/:id", postController.deletePost);


router.post('/users', async (req, res) => {
    const { userIds } = req.body;
    if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ message: "userIds doit être un tableau non vide" });
    }

    try {
        const posts = await Post.find({ author: { $in: userIds } });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: "Erreur lors de la récupération des posts." });
    }
});

router.get('/user/:id', async (req, res) => {
    const userId = req.params.id;
    console.log("userId reçu :", userId);

    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "ID utilisateur invalide" });
        }

        const objectId = new mongoose.Types.ObjectId(userId);
        const posts = await Post.find({ author: objectId })
            .sort({ createdAt: -1 });

        console.log("Nombre de posts :", posts.length);
        res.json(posts);
    } catch (err) {
        console.error("Erreur MongoDB :", err);
        res.status(500).json({
            message: "Erreur lors de la récupération des posts.",
            error: err.message,
        });
    }
});

module.exports = router;


