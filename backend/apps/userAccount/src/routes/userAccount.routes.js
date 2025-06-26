const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');
const router = express.Router();

// Liste tous les utilisateurs
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/search', async (req, res) => {
  const query = req.query.query;
  if (!query) return res.status(400).json({ error: 'Requête vide' });

  try {
    const regex = new RegExp(query, 'i');
    const users = await User.find({
      $or: [
        { username: { $regex: regex } },
        { name: { $regex: regex } }
      ]
    }).select('username name avatar');

    res.json(users);
  } catch (err) {
    console.error("🔴 Erreur dans /users/search :", err); // ⬅️ AJOUTE CECI
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Met à jour un utilisateur par son ID
router.post("/batch", async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "Liste d'identifiants invalide" });
    }

    const users = await User.find({ _id: { $in: userIds } })
        .select("username name avatar createdAt");

    // Transformer en dictionnaire pour accès direct par ID
    const userMap = {};
    users.forEach(user => {
      userMap[user._id] = {
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        createdAt: user.createdAt
      };
    });

    res.json(userMap);
  } catch (err) {
    console.error("Erreur batch users :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Supprime un utilisateur par son ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json({ message: 'Utilisateur supprimé' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true, select: '-password' }
    );
    if (!updatedUser) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "ID invalide" });
  }

  try {
    const user = await User.findById(req.params.id)
        .select("username name bio avatar createdAt");

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.json(user);
  } catch (err) {
    console.error("Erreur lors de la récupération du profil :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;