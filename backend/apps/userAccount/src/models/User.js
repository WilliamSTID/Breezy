const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: { 
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  // Autres informations utilisateur qui ne sont pas liées à l'authentification
  // comme préférences, paramètres, etc.
});

// Plus de méthode comparePassword car le service ne gère plus l'authentification

module.exports = mongoose.model('User', userSchema);