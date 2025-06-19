const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
  // Autres champs selon les besoins
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);