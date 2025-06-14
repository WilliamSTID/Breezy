const mongoose = require('mongoose');

const UserProfileSchema = new mongoose.Schema({
  username: String,
  avatar: String,
  // Ajoute d'autres champs selon ton besoin
});

module.exports = mongoose.model('UserProfile', UserProfileSchema);