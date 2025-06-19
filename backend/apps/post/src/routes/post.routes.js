const express = require("express");
const { setPosts, getPosts, editPost, deletePost } = require("../controllers/post.controllers");
const authenticateToken = require('../../libs/auth/authenticateToken');
const User = require("../models/User");

//Appel de la fonfoction router sur la constante router
const router = express.Router();
//création des API CRUD

router.get("/", getPosts);
router.post("/", setPosts);
router.put("/:id", editPost);
router.delete("/:id", deletePost);

router.get(
  "/",
  authenticateToken,
  async (req, res) => {
    const users = await User.find({}, { username: 1, _id: 0 });
    res.json(users);
  }
);

module.exports = router;

