const Comment = require('../models/Comment');
const Like = require('../models/Like');
const User = require('../models/User');
const PostModel = require('../models/post.models');
const mongoose = require('mongoose');


exports.addComment = async (req, res) => {
  const { postId, author, content } = req.body;

  try {
    const comment = new PostModel({
      content,
      author,
      parentId: postId, // ← indique que c'est un commentaire
    });

    await comment.save();
    await comment.populate('author', 'username'); // pour afficher le nom

    res.status(201).json(comment);
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

// // POST /likes/toggle
// exports.toggleLike = async (req, res) => {
//   const { postId, userId } = req.body;
//
//   try {
//     const existingLike = await Like.findOne({ postId, userId });
//
//     if (existingLike) {
//       await Like.deleteOne({ _id: existingLike._id });
//       return res.status(200).json({ message: 'Like retiré.' });
//     } else {
//       const newLike = new Like({ postId, userId });
//       await newLike.save();
//       return res.status(201).json({ message: 'Post liké.', like: newLike });
//     }
//   } catch (err) {
//     res.status(500).json({ message: 'Erreur lors du traitement du like.' });
//   }
// };


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
    const comments = await PostModel.find({
      parentId: new mongoose.Types.ObjectId(postId)
    })
        .sort({ createdAt: 1 })
        .populate('author', 'username');

    res.json(comments);
  } catch (err) {
    console.error("Erreur Mongo:", err);
    res.status(500).json({
      message: 'Erreur lors de la récupération des commentaires.',
      error: err.message,
    });
  }
};

exports.countComments = async (req, res) => {
  const { postIds } = req.body;

  if (!Array.isArray(postIds) || postIds.length === 0) {
    return res.status(400).json({ message: "postIds doit être un tableau non vide." });
  }

  try {
    const counts = await PostModel.aggregate([
      {
        $match: {
          parentId: { $in: postIds.map(id => new mongoose.Types.ObjectId(id)) },
        }
      },
      {
        $group: {
          _id: '$parentId',
          count: { $sum: 1 },
        }
      }
    ]);

    const result = counts.map(c => ({
      postId: c._id.toString(),
      count: c.count,
    }));

    res.json(result);
  } catch (err) {
    console.error("Erreur countComments:", err);
    res.status(500).json({ message: "Erreur lors du comptage des commentaires", error: err.message });
  }
};


exports.toggleLike = async (req, res) => {
  const { id, userId, type } = req.body;
  const model = PostModel; // même si "type" est inutile ici car tout est dans Post

  if (!id || !userId) {
    return res.status(400).json({ message: "id et userId requis" });
  }

  try {
    const post = await PostModel.findById(id); // ← Correction ici
    if (!post) {
      return res.status(404).json({ message: "Post non trouvé" });
    }

    const alreadyLiked = post.likedBy.includes(userId);

    if (alreadyLiked) {
      post.likedBy.pull(userId);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      post.likedBy.push(userId);
      post.likes += 1;
    }

    await post.save();

    res.status(200).json({
      id,
      liked: !alreadyLiked,
      likes: post.likes,
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors du like", error: err.message });
  }
};

