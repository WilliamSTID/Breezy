const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Email déjà utilisé." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({ message: "Utilisateur créé avec succès." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
    try {
      console.log("Body reçu :", req.body);
  
      const { email, password } = req.body;
  
      const user = await User.findOne({ email });
      if (!user) {
        console.log("Utilisateur introuvable");
        return res.status(400).json({ message: "Utilisateur introuvable." });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log("Mauvais mot de passe");
        return res.status(400).json({ message: "Mot de passe incorrect." });
      }
  
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
  
      console.log("Connexion réussie");
  
      res.status(200).json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      });
    } catch (err) {
      console.error("Erreur login :", err.message);
      res.status(500).json({ error: err.message });
    }
  });

module.exports = router;