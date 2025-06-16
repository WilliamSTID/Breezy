const Comment = require('../models/Comment');
const Like = require('../models/Like');

exports.addComment = async (req, res) => {
  const { postId, author, content, parentComment } = req.body;
  try {
    const comment = new Comment({ postId, author, content, parentComment });
    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de l'ajout du commentaire." });
  }
};

exports.likePost = async (req, res) => {
  const { postId, userId } = req.body;
  try {
    const exists = await Like.findOne({ postId, userId });
    if (exists) return res.status(400).json({ message: "Déjà liké." });
    const like = new Like({ postId, userId });
    await like.save();
    res.status(201).json(like);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors du like." });
  }
};