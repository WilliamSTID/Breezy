const express = require('express');
const axios = require('axios');
const router = express.Router();

// GET /feed/:userId
router.get('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // 1. Récupérer les followings de l'utilisateur
    const followersRes = await axios.get(`http://followers:4002/following/${userId}`);
    const followings = [...new Set([...followersRes.data.map(f => f.user), userId])];

    if (followings.length === 0) return res.json([]);

    // 2. Récupérer les posts des followings
    const postsRes = await axios.post('http://post:4006/api/posts/users', {
      userIds: followings
    });

    const posts = postsRes.data;
    if (posts.length === 0) return res.json([]);

    const postIds = posts.map(p => p._id);

    // 3. Récupérer les likes globaux (nombre total de likes par post)
    const likesRes = await axios.post('http://interaction:4007/likes/count', {
      postIds
    });
    const likeMap = new Map(likesRes.data.map(like => [like.postId, like.likeCount]));

    // 4. Récupérer les likes spécifiques de l'utilisateur
    const userLikesRes = await axios.post('http://interaction:4007/query', {
      userId,
      postIds: posts.map(p => p._id)

    });
    const likedPostIds = new Set(userLikesRes.data.map(like => like.postId));

    const commentCounts = await axios.post('http://interaction:4007/comments/count', {
      postIds: posts.map(p => p._id),
    });

    const commentMap = new Map(commentCounts.data.map(c => [c.postId, c.count]));

    // 5. Fusionner les infos dans chaque post
    const postsWithDetails = posts.map(post => ({
      ...post,
      likes: likeMap.get(post._id) || 0,
      liked: likedPostIds.has(post._id),
      commentCount: commentMap.get(post._id) || 0,
    }));


    // 6. Trier par date décroissante
    postsWithDetails.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(postsWithDetails);
  } catch (err) {
    console.error("Erreur dans /feed/:userId :", err);
    res.status(500).json({
      error: 'Erreur lors de la récupération du feed',
      // details: err.message,
      erreur: err});
    }
});

module.exports = router;