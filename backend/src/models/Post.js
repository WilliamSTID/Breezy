const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  // Ajoute d'autres champs si besoin (ex: title, images, etc.)
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);