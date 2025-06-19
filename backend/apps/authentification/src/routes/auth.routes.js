const express = require("express");
const mongoose = require("mongoose");
const authMiddleware = require("../middlewares/auth.controller.js");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const router = express.Router();

router.get("/Users", authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur." });
  }
});

router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "Utilisateur créé" });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Erreur lors de la création", error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user)
    return res.status(400).json({ message: "Utilisateur inconnu" });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid)
    return res.status(401).json({ message: "Mot de passe incorrect" });

  const token = jwt.sign(
    { username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  res.json({ token });
});

module.exports = router;

const app = express();

app.use(express.json());
app.use("/api/users", router);

mongoose
  .connect("mongodb://localhost:27017/breezy", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connecté");
    app.listen(4005, () => {
      console.log("authentification service running on port 4005");
    });
  })
  .catch((err) => {
    console.error("Erreur de connexion MongoDB", err);
  });