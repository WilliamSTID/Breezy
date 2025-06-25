const PostModel = require('../models/post.models');
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
        const { author, content, parentId, title, imageUrl, tags, isPublic } = req.body;

        const post = new PostModel({
            author,
            content,
            parentId: parentId || null, // null si c’est un post principal
            title,
            imageUrl,
            tags,
            isPublic,
        });

        await post.save();

        // Tu peux décider ici de faire un populate de l’auteur si nécessaire
        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({
            message: "Erreur lors de la création du post/commentaire.",
            erreur: err,
        });
    }
};

//Module pour modifier les données
module.exports.editPost=async(req,res)=>{
    //identification du post à modifier,renseigner id dans l'url
    const post=await PostModel.findById(req.params.id)
    if (!post){
        res.status(400).json({message:"Post inexsitant"})

    }
    const updatePost= await PostModel.findByIdAndUpdate(post,req.body,{
        new:true
    });
    res.status(200).json(updatePost);
};

//suppression d'un post
module.exports.deletePost = async (req, res) => {
    const post = await PostModel.findById(req.params.id);
    if (!post) {
        return res.status(404).json({ message: "Post inexistant" });
    }

    await PostModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Post supprimé avec succès" });
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

module.exports.getCommentsByPostId = async (req, res) => {
    try {
        const { postId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ message: "ID de post invalide" });
        }

        const comments = await PostModel.find({ parentId: postId })
            .populate("author", "username")
            .sort({ createdAt: 1 });

        res.status(200).json(comments);
    } catch (err) {
        res.status(500).json({ message: "Erreur lors de la récupération des commentaires.", err });
    }
};

