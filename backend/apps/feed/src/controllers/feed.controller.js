const axios = require("axios");

exports.getFeed = async (req, res) => {
  const { userId } = req.params;

  const token = req.headers.authorization?.split(' ')[1]; // 🔑 récupérer le token

  try {
    const { data: following } = await axios.get(
        `http://followers:4002/followers/following/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
    );

    // Récupérer les posts des comptes suivis
    const posts = [];
    for (const user of following) {
      const { data: userPosts } = await axios.get(`http://post:4006/post/user/${user._id}`);
      posts.push(...userPosts);
    }

    // Trier par date
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(posts);
  } catch (err) {
    console.error("Erreur dans /feed/:userId :", err);
    res.status(500).json({ message: "Erreur lors de la récupération du feed." });
  }
};
