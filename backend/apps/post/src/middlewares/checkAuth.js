const jwt = require("jsonwebtoken");
require("dotenv").config();


module.exports = (req, res, next) => {
    console.log("Authorization reçu :", req.headers.authorization);
    console.log("Clé secrète utilisée :", process.env.JWT_SECRET);

    const authHeader = req.headers.authorization;


    if (!authHeader) return res.status(401).json({ message: "Token manquant" });

    const token = authHeader.split(" ")[1]; // Format "Bearer <token>"

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // JWT doit contenir { id: userId, ... }
        next();
    } catch (err) {
        res.status(403).json({ message: "Token invalide" });
    }
};