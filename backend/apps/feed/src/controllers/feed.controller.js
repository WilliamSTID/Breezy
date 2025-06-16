const axios = require('axios');

exports.getFeed = async (req, res) => {
  const { userId } = req.params;
  try {
    // Récupérer la liste des suivis (followers microservice)
    const { data: following } = await axios.get(`http://followers:4002/followers/following/${userId}`);
    // Récupérer les posts des suivis (post microservice)
    const posts = [];
    for (const user of following) {
      const { data: userPosts } = await axios.get(`http://post:4006/post/user/${user._id}`);
      posts.push(...userPosts);
    }
    // Trier par date décroissante
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération du feed." });
  }
};