const express=require("express");
const { setPosts, getPosts, editPost,deletePost } = require("../controllers/post.controllers");

//Appel de la fonfoction router sur la constante router
const router=express.Router();
//création des API CRUD

router.get("/",getPosts);
router.post("/",setPosts);
router.put("/:id",editPost);
//router.patch("/like-post/:id", likePost);
//router.patch("/dislike-post/:id", dislikePost);
router.delete("/:id", deletePost);

// router.get("/",(req,res)=>{
// res.json({message:"Données pésentes"});
// });

// router.post("/",(req,res)=>{
//  res.json({message:req.body.message});
//  });
//Remplacement des req,res par des fonctions ici setPosts


 //renseigner un ID au moment de la mise à =jour et suppression 
//  router.put("/:id",(req,res)=>{
//     res.json({messageId:req.params.id});
//  });
//MAJ PUT


//  router.delete("/:id",(req,res)=>
// {
//     res.json({message:`Post supprimé ${req.params.id}`});
// });

//Tableau des personnes ayant liké ajout et retrait des personnes du tableau


// router.patch("/Like-post/:id",(req,res)=>{
//     res.json({ message:`Post Liké:id ${req.params.id}`});

// });



// router.patch("/disLike-post/:id",(req,res)=>{
//     res.json({ message:`Post disliké:id ${req.params.id}`});

// });

module.exports=router;

