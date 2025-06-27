const Comment = require('../models/Comment');
const Like = require('../models/Like');
const User = require('../models/User');
const mongoose = require('mongoose');


exports.addComment = async (req, res) => {
  const { postId, author, content, parentComment } = req.body;
  if (!content || content.length > 280) {
    return res.status(400).json({ message: "Le commentaire ne doit pas dépasser 280 caractères." });
  }
  try {
    const comment = new Comment({ postId, author, content, parentComment });
    const saved = await comment.save();
    await saved.populate("author", "username name avatar");
    res.status(201).json(saved);
  } catch (err) {
    console.error("Erreur addComment:", err);
    res.status(500).json({ message: "Erreur lors de l'ajout du commentaire." });
  }
};


// exports.likePost = async (req, res) => {
//   const { postId, userId } = req.body;
//   try {
//     const exists = await Like.findOne({ postId, userId });
//     if (exists) return res.status(400).json({ message: "Déjà liké." });
//     const like = new Like({ postId, userId });
//     await like.save();
//     res.status(201).json(like);
//   } catch (err) {
//     res.status(500).json({ message: "Erreur lors du like." });
//   }
// };

// POST /likes/toggle
exports.toggleLike = async (req, res) => {
  const { postId, userId } = req.body;

  try {
    const existingLike = await Like.findOne({ postId, userId });

    if (existingLike) {
      await Like.deleteOne({ _id: existingLike._id });
      return res.status(200).json({ message: 'Like retiré.' });
    } else {
      const newLike = new Like({ postId, userId });
      await newLike.save();
      return res.status(201).json({ message: 'Post liké.', like: newLike });
    }
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors du traitement du like.' });
  }
};


// controllers/likeController.js
exports.countLikes = async (req, res) => {
  console.log("Interaction countlikes", req.body)
  const {postIds} = req.body;

  if (!Array.isArray(postIds) || postIds.length === 0) {
    return res.status(400).json({message: "postIds doit être un tableau non vide."});
  }

  try {
    const counts = await Like.aggregate([
      {
        $match: {
          postId: {$in: postIds.map(id => new mongoose.Types.ObjectId(id))}
        }
      },
      {
        $group: {
          _id: '$postId',
          likeCount: {$sum: 1}
        }
      }
    ]);

    const response = counts.map(c => ({
      postId: c._id.toString(),
      likeCount: c.likeCount
    }));

    res.json(response);
  } catch (err) {
    console.error("Erreur dans /likes/count :", err);
    res.status(500).json({
      message: "Erreur lors du comptage des likes.",
      error: err.message,
    });
  }
}

exports.getUserLikesForPosts = async (req, res) => {
  let { userId, postIds } = req.body;

  if (!postIds && req.body.postId) {
    postIds = [req.body.postId];
  }

  console.log(req.body);
  try {
    const likes = await Like.find({
       userId,
      postId: { $in: postIds.map(id => new mongoose.Types.ObjectId(id)) }
    });
    res.json(likes); // [{ postId, userId, ... }]
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des likes utilisateur.' });
  }
};

exports.getCommentsForPost = async (req, res) => {
  const { postId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: "postId invalide" });
  }

  try {
    const comments = await Comment.find({
      postId: new mongoose.Types.ObjectId(postId),
      // parentComment: null
    })
        .sort({ createdAt: 1 })
        .populate('author', 'username name avatar');

    res.json(comments);
  } catch (err) {
    console.error("Erreur Mongo:", err);
    res.status(500).json({
      message: 'Erreur lors de la récupération des commentaires.',
      error: err.message,
    });
  }
};

// POST /comments/count
exports.countComments = async (req, res) => {
  const { postIds } = req.body;

  try {
    const counts = await Comment.aggregate([
      {
        $match: {
          postId: { $in: postIds.map(id => new mongoose.Types.ObjectId(id)) },
        }
      },
      {
        $group: {
          _id: '$postId',
          count: { $sum: 1 },
        }
      }
    ]);

    res.json(counts.map(c => ({
      postId: c._id.toString(),
      count: c.count,
    })));
  } catch (err) {
    res.status(500).json({ message: "Erreur lors du comptage des commentaires", error: err.message });
  }
};

exports.updateComment = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content || content.length > 280) {
    return res.status(400).json({ message: "Contenu invalide." });
  }

  try {
    const updated = await Comment.findByIdAndUpdate(
        id,
        { content },
        { new: true }
    ).populate("author", "username name avatar");

    if (!updated) {
      return res.status(404).json({ message: "Commentaire non trouvé." });
    }

    res.json(updated);
  } catch (err) {
    console.error("Erreur updateComment:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// Supprime un commentaire et toutes ses réponses
exports.deleteComment = async (req, res) => {
  const { id } = req.params;

  try {
    const collectNestedIds = async (parentId) => {
      const children = await Comment.find({ parentComment: parentId });
      const ids = [parentId];

      for (const child of children) {
        const childIds = await collectNestedIds(child._id);
        ids.push(...childIds);
      }

      return ids;
    };

    const allToDelete = await collectNestedIds(id);

    await Comment.deleteMany({ _id: { $in: allToDelete } });

    res.json({ message: `Commentaire et ${allToDelete.length - 1} réponses supprimés` });
  } catch (err) {
    console.error("Erreur deleteComment cascade:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

