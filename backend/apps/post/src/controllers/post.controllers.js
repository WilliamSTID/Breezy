const PostModel=require('../models/post.models');
const mongoose = require("mongoose");

//Module pour obtenir des données  utilisation de getPosts et de la fonction find
module.exports.getPosts=async(req,res)=>{
    const posts= await PostModel.find();
    res.status(200).json(posts);
};




//Mise en place d'un message avec la fonction setPosts
module.exports.setPosts=async(req,res)=>{
    //Boucle de vérification de contenu d'un message 
    if(!req.body.message){
        res.status(400).json({message:"Ajouter un message"})
    }
    //create permet de créer de nouveaux messages dans la BDD avec le shéma de PostModel
    const post= await PostModel.create({
        //stockage du message dans la BDD
        message:req.body.message,
        author:req.body.author,

    })
    res.status(200).json(post);
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

//Module pour liker un post



// module.exports.likePost = async (req, res) => {
//     try {
//         const objectId = new mongoose.Types.ObjectId(req.body.userId);
//         const post = await PostModel.findByIdAndUpdate(
//             req.params.id,
//             { $addToSet: { likers: objectId } },
//             { new: true }
//         );
//         res.status(200).send(post);
//     } catch (err) {
//         console.error("Erreur dans likePost :", err);
//         res.status(400).json({ message: "Erreur serveur", error: err.message });
//     }
// };



// //Module pour disliker un post

// module.exports.dislikePost = async (req, res) => {
//     try {
//         const objectId = new mongoose.Types.ObjectId(req.body.userId);
//         const post = await PostModel.findByIdAndUpdate(
//             req.params.id,
//             { $pull: { likers: objectId } },
//             { new: true }
//         );
//         res.status(200).send(post);
//     } catch (err) {
//         console.error("Erreur dans dislikePost :", err);
//         res.status(400).json({ message: "Erreur serveur", error: err.message });
//     }
// };


