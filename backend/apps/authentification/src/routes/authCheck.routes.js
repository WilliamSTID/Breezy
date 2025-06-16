// src/routes/authCheck.routes.js

const express = require("express");
const verifyToken = require("../middlewares/auth.middlewares");

const router = express.Router();

router.get("/", verifyToken, (req, res) => {
  res.json({ message: "✅ Authentification OK", user: req.user });
});

module.exports = router;