const express = require('express');
const mongoose = require('mongoose');
const Post = require('./src/models/Post');
require('dotenv').config();
console.log('JWT_SECRET:', process.env.JWT_SECRET);

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 4003;

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/breezy');

// Voir tous ses messages
app.get('/profile/:userId/posts', async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// Modifier un de ses messages
app.put('/profile/:userId/posts/:postId', async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      { _id: req.params.postId, author: req.params.userId },
      { $set: req.body },
      { new: true }
    );
    if (!post) return res.status(404).json({ message: "Post non trouvé ou non autorisé." });
    res.json(post);
  } catch (err) {
    console.error('Erreur PUT /profile/:userId/posts/:postId:', err); // Ajoute ce log
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// Ajouter un nouveau message
app.post('/profile/:userId/posts', async (req, res) => {
  try {
    const post = new Post({
      author: req.params.userId,
      content: req.body.content
    });
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur." });
  }
});

app.use("/auth", require("./src/routes/auth")); 

app.listen(PORT, () => {
  console.log(`userProfile service running on port ${PORT}`);
});