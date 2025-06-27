const express = require('express');
const router = express.Router();
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const FormData = require("form-data");

const userProfileMiddleware = require('../middlewares/userProfile.controller');
const User = require("../models/User");
const upload = require("../middlewares/upload");

require('dotenv').config();

const userProfileController = require('../controllers/userProfile.controller.js');
const UserProfile = require('../models/UserProfile'); 

// // Protège toutes les routes suivantes
// router.use(userProfileMiddleware);

router.get('/profile/:userId/posts', userProfileController.getUserPosts);
router.put('/profile/:userId/posts/:postId', userProfileController.modifyUserPost);
router.post('/profile/:userId/posts', async (req, res) => {
  try {
    res.json({ message: 'Post créé' });
  } catch (err) {
    console.error(err); 
    res.status(500).json({ message: "Erreur serveur." });
  }
});
router.get('/userprofiles', async (req, res) => {
  try {
    const profiles = await UserProfile.find();
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur." });
  }
});
router.post('/userprofile', async (req, res) => {
  const userProfile = new UserProfile({
    ...req.body
  });
  try {
    const savedProfile = await userProfile.save();
    res.status(201).json(savedProfile);
  } catch (err) {
    if (err.code === 11000 && err.keyPattern && err.keyPattern.userId) {
      // Erreur d'unicité sur userId
      return res.status(409).json({ message: "Le profil utilisateur existe déjà." });
    }
    console.error(err);
    res.status(400).json({ message: "Erreur lors de la création du profil." });
  }
});
router.put('/userprofile/:userId', async (req, res) => {
  try {
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId: req.params.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedProfile) return res.status(404).json({ message: "Profil non trouvé." });
    res.json(updatedProfile);
  } catch (err) {
    res.status(400).json({ message: "Erreur lors de la mise à jour du profil." });
  }
});

// Exemple de route POST /userprofile
router.post('/', async (req, res) => {
  // ... logique de création de profil ...
  res.json({ message: 'Profil créé' });
});


router.get("/me", async (req, res) => {
  console.log("👉 Route GET /me appelée");

  try {
    const userId = req.header("X-User-Id"); // transmis par la gateway
    if (!userId) return res.status(401).json({ message: "ID utilisateur manquant" });

    const user = await User.findById(userId).select("username name bio avatar createdAt");
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    res.json(user);
  } catch (err) {
    console.error("Erreur userProfile /me:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.put("/me", upload.single("avatar"), async (req, res) => {
  try {
    const userId = req.header("X-User-Id");
    if (!userId) return res.status(401).json({ message: "ID utilisateur manquant" });

    const { name, bio } = req.body;
    const update = { name, bio };

    // Si avatar fourni, on le transfère à authentification
    if (req.file) {
      const form = new FormData();
      form.append("avatar", fs.createReadStream(req.file.path), req.file.originalname);

      const uploadRes = await fetch("http://authentification:4005/internal/avatar-upload", {
        method: "POST",
        body: form,
        headers: {
          ...form.getHeaders(),
          "x-api-key": process.env.INTERNAL_API_KEY // si clé API activée
        },
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error("Échec du transfert de l'avatar");

      update.avatar = uploadData.avatar;

      // Nettoyage fichier temporaire
      fs.unlink(req.file.path, () => {});
    }

    const user = await User.findByIdAndUpdate(userId, update, { new: true }).select("username name bio avatar createdAt");
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    res.json(user);
  } catch (err) {
    console.error("Erreur PUT /me :", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


module.exports = router;
