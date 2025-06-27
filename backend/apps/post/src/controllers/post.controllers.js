const PostModel = require('../models/Post');
const mongoose = require("mongoose");

// GET avec pagination et recherche
module.exports.getPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;
        const query = search
            ? { content: { $regex: search, $options: "i" } }
            : {};

        const posts = await PostModel.find(query)
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .sort({ createdAt: -1 });

        const total = await PostModel.countDocuments(query);

        res.status(200).json({
            posts,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit)
        });
    } catch (err) {
        res.status(500).json({ message: "Erreur lors de la récupération des posts." });
    }
};




//Mise en place d'un message avec la fonction setPosts
module.exports.setPosts = async (req, res) => {
    try {
        const { author, content, title, imageUrl, tags, isPublic } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ message: "Le contenu du post est requis." });
        }

        if (content.length > 280) {
            return res.status(400).json({ message: "Le post ne doit pas dépasser 280 caractères." });
        }

        const post = new PostModel({ author, content, title, imageUrl, tags, isPublic });
        await post.save();
        res.status(201).json(post);
    } catch (err) {
        console.error("Erreur setPosts:", err);
        res.status(500).json({
            message: "Erreur lors de la création du post.",
            erreur: err.message,
        });
    }
};


// Modifier un post
module.exports.editPost = async (req, res) => {
    try {
        const post = await PostModel.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post inexistant" });

        // Vérification sécurisée
        if (!post.author || post.author.toString() !== req.user.id) {
            return res.status(403).json({ message: "Non autorisé à modifier ce post" });
        }

        // Mise à jour manuelle et sauvegarde
        post.content = req.body.content || post.content;
        await post.save();

        res.status(200).json(post);
    } catch (err) {
        res.status(500).json({ message: "Erreur lors de la modification", error: err.message });
    }
};


// Supprimer un post
module.exports.deletePost = async (req, res) => {
    try {
        const post = await PostModel.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post inexistant" });

        // Vérification d'identité de l'auteur
        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({ message: "Non autorisé à supprimer ce post" });
        }

        await PostModel.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Post supprimé avec succès" });
    } catch (err) {
        res.status(500).json({ message: err.message,
        "erreur":err});
    }
};

// // Récupérer les posts par utilisateur
// module.exports.getPostsByUser = async (req, res) => {
//     try {
//         const posts = await PostModel.find({ author: req.params.userId });
//         res.json(posts);
//     } catch (err) {
//         res.status(500).json({ message: "Erreur lors de la récupération des posts." });
//     }
// };

// routes/posts.js ou similaire
module.exports.getPostsByUser = async (req, res) => {
    try {
        const { userIds } = req.body;
        if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ message: "userIds doit être un tableau non vide." });
        }

        const posts = await PostModel.find({ author: { $in: userIds } });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: "Erreur lors de la récupération des posts." });
    }
};




