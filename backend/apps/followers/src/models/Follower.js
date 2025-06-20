const mongoose = require('mongoose');

const followerSchema = new mongoose.Schema({
  follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // celui qui suit
  followed: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // celui qui est suivi
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Follower', followerSchema);