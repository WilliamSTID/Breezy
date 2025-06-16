const mongoose = require('mongoose');
require('../models/User'); // Ajoute ceci en haut du fichier

const FollowerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // celui qui est suivi
  follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // celui qui suit
}, { timestamps: true });

module.exports = mongoose.model('Follower', FollowerSchema); 