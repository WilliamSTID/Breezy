const mongoose = require('mongoose');

const followerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // celui qui est suivi
  follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // celui qui suit
},{ timestamps: true });

module.exports = mongoose.model('Followers', followerSchema);