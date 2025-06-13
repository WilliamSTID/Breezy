const Post = require("../models/Post");

module.exports = {

// Récupérer les messages d'un utilisateur
    getUserPosts: async (req, res) => {
        try {
            const posts = await Post.find({ author: req.params.userId }).sort({ createdAt: -1 });
            res.json(posts);
        } catch (err) {
            res.status(500).json({ message: "Erreur serveur." });
        }
    },

// Modifier un de ses messages
    modifyUserPost: async (req, res) => {
    try {
        const post = await Post.findOneAndUpdate(
            { _id: req.params.postId, author: req.params.userId },
            { $set: req.body },
            { new: true }
        );
        if (!post) return res.status(404).json({ message: "Post non trouvé ou non autorisé." });
        res.json(post);
    } catch (err) {
        console.error('Erreur PUT /profile/:userId/posts/:postId:', err); // Ajoute ce log
        res.status(500).json({ message: "Erreur serveur." });
    }
    },

// Ajouter un nouveau message
    addUserPost: async (req, res) => {
    try {
        const post = new Post({
            author: req.params.userId,
            content: req.body.content
        });
        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur." });
    }
    },
};