const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middlewares/auth.controller.js");

const router = express.Router();

// Route protégée pour obtenir les infos de l'utilisateur connecté
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error("Erreur dans /me:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;