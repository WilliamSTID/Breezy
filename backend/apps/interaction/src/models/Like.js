const mongoose = require('mongoose');

const LikeSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Post' },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  },{ timestamps: true });

module.exports = mongoose.model('Like', LikeSchema);