const express = require('express');
const mongoose = require('mongoose');
const Follower = require('../src/models/Follower');
const User = require('../src/models/User');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 4002;

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/breezy');

// Suivre un utilisateur
app.post('/follow', async (req, res) => {
  const { userId, followerId } = req.body;
  if (userId === followerId) return res.status(400).json({ message: "Impossible de se suivre soi-même." });
  try {
    const already = await Follower.findOne({ user: userId, follower: followerId });
    if (already) return res.status(400).json({ message: "Déjà suivi." });
    const follow = new Follower({ user: userId, follower: followerId });
    await follow.save();
    res.json({ message: "Suivi avec succès." });
  } catch (err) {
    console.error(err); // Ajoute cette ligne pour voir l’erreur dans le terminal
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// Liste des followers d’un utilisateur
app.get('/followers/:userId', async (req, res) => {
  try {
    const followers = await Follower.find({ user: req.params.userId }).populate('follower', 'username avatar');
    res.json(followers.map(f => f.follower));
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// Liste des utilisateurs suivis par un utilisateur
app.get('/following/:followerId', async (req, res) => {
  try {
    const following = await Follower.find({ follower: req.params.followerId }).populate('user', 'username avatar');
    res.json(following.map(f => f.user));
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur." });
  }
});

app.listen(PORT, () => {
  console.log(`followers service running on port ${PORT}`);
});