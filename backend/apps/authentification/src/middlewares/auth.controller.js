const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const token = req.header("Authorization");

    if (!token) return res.status(401).json({ message: "Accès refusé. Aucun token fourni." });

    req.user = jwt.verify(token, process.env.JWT_SECRET);

    next();
  } catch (err) {
    res.status(401).json({ message: "Token invalide." });
  }
};

module.exports = auth;