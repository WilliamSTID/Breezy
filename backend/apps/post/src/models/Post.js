const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: {
    type: String,
    required: true,
    maxlength: 280
  },
  // images: [{ type: String }], // Tableau d'URL d'images
  // videos: [{ type: String }], // Tableau d'URL de vidéos
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema); 