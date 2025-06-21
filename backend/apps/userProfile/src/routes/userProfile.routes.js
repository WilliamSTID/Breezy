const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.controller'); 

const userProfileController = require('../controllers/userProfile.controller.js');
const UserProfile = require('../models/UserProfile'); 

// Protège toutes les routes suivantes
router.use(auth);

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

module.exports = router;
