const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');
const router = express.Router();

// Liste tous les utilisateurs
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Met à jour un utilisateur par son ID
router.put('/users/:id', async (req, res) => {
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

// Supprime un utilisateur par son ID
router.delete('/users/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json({ message: 'Utilisateur supprimé' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
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