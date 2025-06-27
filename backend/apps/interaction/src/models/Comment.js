const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Post' },
  author: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  content: {
    type: String,
    required: true,
    maxlength: 280,
  } ,
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }, // pour les réponses à un commentaire
},{ timestamps: true });

module.exports = mongoose.model('Comment', CommentSchema);