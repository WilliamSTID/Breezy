const express=require("express");
const { setPosts, getPosts, editPost,deletePost } = require("../controllers/post.controllers");

//Appel de la fonfoction router sur la constante router
const router=express.Router();
//création des API CRUD

router.get("/",getPosts);
router.post("/",setPosts);
router.put("/:id",editPost);

router.delete("/:id", deletePost);

module.exports = router; 

