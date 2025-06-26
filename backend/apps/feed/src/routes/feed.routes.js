const express = require('express');
const axios = require('axios');
const router = express.Router();

// GET /feed/:userId
router.get('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const authorOnly = req.query.authorOnly === 'true';

    let postFilterIds;

    if (authorOnly) {
      postFilterIds = [userId];
    } else {
      // 1. Récupérer les followings de l'utilisateur
      const followersRes = await axios.get(`http://followers:4002/following/${userId}`);
      postFilterIds = [...new Set([...followersRes.data.map(f => f.user), userId])];
    }

    if (postFilterIds.length === 0) return res.json([]);

    // 2. Récupérer les posts des followings ou de l'utilisateur
    const postsRes = await axios.post('http://post:4006/api/posts/users', {
      userIds: postFilterIds
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
      postIds
    });
    const likedPostIds = new Set(userLikesRes.data.map(like => like.postId));

    // 5. Récupérer le nombre de commentaires
    const commentCounts = await axios.post('http://interaction:4007/comments/count', {
      postIds
    });
    const commentMap = new Map(commentCounts.data.map(c => [c.postId, c.count]));

    // 6. Récupérer les infos utilisateurs (username, avatar)
    const authors = [...new Set(posts.map(p => p.author))];
    const usersRes = await axios.post("http://useraccount:4004/users/batch", {
      userIds: authors
    });
    const users = usersRes.data;
    const userMap = new Map(Object.entries(users));

    // 7. Fusionner les infos dans chaque post
    const postsWithDetails = posts.map(post => ({
      ...post,
      likes: likeMap.get(post._id) || 0,
      liked: likedPostIds.has(post._id),
      commentCount: commentMap.get(post._id) || 0,
      username: userMap.get(post.author)?.username || "Inconnu",
      avatar: userMap.get(post.author)?.avatar || "",
    }));

    // 8. Trier par date décroissante
    postsWithDetails.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(postsWithDetails);
  } catch (err) {
    console.error("Erreur dans /feed/:userId :", err);
    res.status(500).json({
      error: 'Erreur lors de la récupération du feed',
      erreur: err
    });
  }
});

module.exports = router;
