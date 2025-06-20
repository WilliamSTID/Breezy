const mongoose = require('mongoose');

const UserProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  bio: { type: String, default: '' },
  location: { type: String, default: '' },
  avatar: { type: String, default: '' },         // URL de la photo de profil
  website: { type: String, default: '' },        // Site web personnel
  birthdate: { type: Date },                     // Date de naissance
  name: { type: String, default: '' },           // Nom complet
  gender: { type: String, enum: ['male', 'female', 'other', ''], default: '' },
  interests: [{ type: String }],                 // Liste des centres d'intérêt
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserProfile', UserProfileSchema);