const express = require('express');
const axios = require('axios');
const router = express.Router();

// GET /feed/:userId
router.get('/:userId', async (req, res) => {
  try {
    // 1. Récupérer les followings de l'utilisateur
    const followersRes = await axios.get(`http://followers:4002/following/${req.params.userId}`);
    // console.log(followersRes);
    const followings = [...new Set([...followersRes.data.map(f => f.user), req.params.userId])];
    console.log(followings);

    if (followings.length === 0) return res.json([]);

    // 2. Récupérer les posts des followings
    const postsRes = await axios.post('http://post:4006/api/posts/users', {
      userIds: followings
    });
    console.log(postsRes.data)
    const posts = postsRes.data;

    const likesRes = await axios.post('http://interaction:4007/likes/count', {
      postIds: posts.map(p => p._id)
    });

    const likeMap = new Map(likesRes.data.map(like => [like.postId, like.likeCount]));

    const postsWithLikes = posts.map(post => ({
      ...post,
      likes: likeMap.get(post._id) || 0
    }));

    // 3. Trier les posts par date décroissante
    postsWithLikes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération du feed',
                            erreur: err});
  }
});

module.exports = router;