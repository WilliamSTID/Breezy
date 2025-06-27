const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    index: true // Ajoute un index pour accélérer les recherches
  },
  email: {
    type: String, 
    required: true,
    unique: true,
    lowercase: true,
    index: true // Ajoute un index pour accélérer les recherches
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  bio: {
    type: String,
    default: "Test BIO"
  },
  avatar: {
    type: String,
    default: "https://i.pinimg.com/originals/d3/7e/84/d37e843d31252c02e0b6119d126d6014.jpg"
  },
  name: {
    type: String,
    trim: true,
    default: function() {
      return this.username;
    }
  }
}, { 
  timestamps: true,
  // Optimisations de performance
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index composé pour les recherches combinées (très utile pour la méthode findOne avec $or)
UserSchema.index({ email: 1, username: 1 });

module.exports = mongoose.model("User", UserSchema);