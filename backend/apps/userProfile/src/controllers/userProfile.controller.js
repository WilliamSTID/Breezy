const Post = require('../models/Post'); // Ajoute cette ligne
const axios = require('axios');

module.exports = {

// Récupérer les messages d'un utilisateur
    getUserPosts: async (req, res) => {
        const userId = req.params.userId;
        try {
            // Appel au microservice post (adapte le port si besoin)
            const response = await axios.get(`http://post:4006/api/posts/user/${userId}`);
            res.json(response.data);
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ message: "Erreur lors de la récupération des posts." });
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
        console.error('Erreur dans modifyUserPost:', err);
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