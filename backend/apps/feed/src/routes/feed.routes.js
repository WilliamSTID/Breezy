const express = require('express');
const axios = require('axios');
const router = express.Router();

// GET /feed/:userId
router.get('/:userId', async (req, res) => {
  try {
    // 1. Récupérer les followings de l'utilisateur
    const followersRes = await axios.get(`http://followers:4002/following/${req.params.userId}`);
    const followings = followersRes.data.map(f => f.followed);

    if (followings.length === 0) return res.json([]);

    // 2. Récupérer les posts des followings
    const postsRes = await axios.post('http://post:4006/posts/by-users', { userIds: followings });
    const posts = postsRes.data;

    // 3. Trier les posts par date décroissante
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération du feed' });
  }
});

module.exports = router;