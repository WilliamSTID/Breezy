const mongoose = require('mongoose');

//Création d'un shema
const PostSchema = new mongoose.Schema({
  author: { type: String, required: true },
  content: { type: String, required: true },
  title: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  tags: [{ type: String }],
  isPublic: { type: Boolean, default: true },
  likesCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  },{ timestamps: true });

module.exports = mongoose.model('Post', PostSchema);