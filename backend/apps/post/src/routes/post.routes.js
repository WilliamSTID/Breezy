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

router.get("/comments/:postId", postController.getCommentsByPostId);


router.post('/users', async (req, res) => {
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ message: "userIds doit être un tableau non vide" });
    }

    try {
        const posts = await Post.find({
            author: { $in: userIds },
            parentId: null // ← Exclure les commentaires
        });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: "Erreur lors de la récupération des posts." });
    }
});
module.exports = router;


