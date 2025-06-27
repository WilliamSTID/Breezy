const express = require('express');
const router = express.Router();
const pulbicProfileController = require('../controllers/publicProfile.controller.js');
const User = require('../models/User');
const Post = require('../models/Post');
const axios = require('axios');
const jwt = require('jsonwebtoken');

router.get('/profile/:username', pulbicProfileController.getUserAccountInformation);
router.get('/publicprofiles', async (req, res) => {
  try {
    const profiles = await User.find();
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer le profil public par userId
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('username name bio avatar');
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer les posts d'un utilisateur
router.get('/:userId/posts', async (req, res) => {
  try {
    const userId = req.params.userId;
    const token = req.headers.authorization?.split(" ")[1];

    const posts = await Post.find({ author: userId })
        .populate('author', 'username name avatar')
        .sort({ createdAt: -1 })
        .lean();

    if (posts.length === 0) return res.json([]);

    const postIds = posts.map(p => p._id);

    // Likes et comments
    const [likesRes, commentsRes] = await Promise.all([
      axios.post('http://interaction:4007/likes/count', { postIds }),
      axios.post('http://interaction:4007/comments/count', { postIds }),
    ]);

    const likeMap = new Map(likesRes.data.map(l => [l.postId, l.likeCount]));
    const commentMap = new Map(commentsRes.data.map(c => [c.postId, c.count]));

    // Vérifier les likes utilisateur
    let likedPostIds = new Set();
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Assure-toi d'avoir JWT_SECRET
        const currentUserId = decoded.id;

        const userLikesRes = await axios.post('http://interaction:4007/query', {
          userId: currentUserId,
          postIds
        });

        likedPostIds = new Set(userLikesRes.data.map(l => l.postId));
      } catch (err) {
        console.warn("Token invalide ou échec de décodage :", err.message);
      }
    }

    const enrichedPosts = posts.map(post => ({
      ...post,
      likes: likeMap.get(String(post._id)) || 0,
      commentCount: commentMap.get(String(post._id)) || 0,
      liked: likedPostIds.has(String(post._id)), // ← ici
    }));

    res.json(enrichedPosts);
  } catch (err) {
    console.error("Erreur enrichissement des posts :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


module.exports = router;