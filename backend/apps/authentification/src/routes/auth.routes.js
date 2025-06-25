const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require('../middlewares/auth.controller');
const router = express.Router();
const multer = require("multer");
const path = require("path");

// Middleware pour gérer les erreurs de requêtes
const requestErrorHandler = (handler) => {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (err) {
      console.error(`Erreur API: ${req.method} ${req.path}`, err.message);
      
      if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ message: "Format de requête invalide" });
      }
      
      if (err.name === 'BadRequestError' && err.message === 'request aborted') {
        return res.status(408).json({ message: "Requête interrompue" });
      }
      
      res.status(500).json({ message: "Erreur serveur" });
    }
  };
};

const storage = multer.diskStorage({
  destination: path.join(__dirname, "../uploads/avatars"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${file.fieldname}${ext}`;
    cb(null, name);
  }
});

const upload = multer({ storage });


// Route d'inscription
router.post("/register", upload.single("avatar"), async (req, res) => {
  console.log("=== DEBUG REGISTER ===");
  console.log("req.body:", req.body);
  console.log("req.file:", req.file);
  console.log("Début de la requête d'inscription tto");

  const startTime = Date.now();
  
  try {


    const { username, email, password, bio } = req.body;
    const avatarPath = req.file ? `/uploads/avatars/${req.file.filename}` : undefined;

    // Validation rapide pour éviter les requêtes inutiles vers la base de données
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Tous les champs obligatoires doivent être remplis" });
    }
    
    console.log(`Vérification de l'existence de l'utilisateur: ${username}`);
    
    // Utilisation d'une recherche optimisée avec projection
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    }).select('email username').lean();
    
    if (existingUser) {
      console.log("Utilisateur existant trouvé");
      return res.status(400).json({ 
        message: existingUser.email === email 
          ? "Cet email est déjà utilisé" 
          : "Ce nom d'utilisateur est déjà pris" 
      });
    }
    
    // CRITIQUE: Réduire le coût du hachage pour le développement
    console.log("Début du hachage du mot de passe avec facteur réduit");
    const salt = await bcrypt.genSalt(4); // 4 pour le dev, 10+ pour la prod
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("Hachage terminé en", Date.now() - startTime, "ms");
    
    // Créer l'utilisateur avec le mot de passe déjà haché
    const user = new User({
      username,
      email,
      password: hashedPassword,
      name: username,
      bio: bio || "",
      avatar: avatarPath || ""
    });
    
    console.log("Sauvegarde de l'utilisateur dans MongoDB");
    await user.save();
    console.log("Utilisateur sauvegardé");
    
    // Générer un token JWT en mode synchrone
    console.log("Génération du token JWT");
    const payload = { id: user.id };
    
    // Utiliser la version synchrone de jwt.sign
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" });
    
    const duration = Date.now() - startTime;
    console.log(`✅ Inscription réussie pour ${username} en ${duration}ms`);
    
    // Retour JSON avec moins de données pour réduire la taille de la réponse
    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Erreur d'inscription après ${duration}ms:`, error);
    
    // Gestion spécifique des erreurs MongoDB
    if (error.name === 'MongoServerError' && error.code === 11000) {
      return res.status(400).json({ message: "Cet email ou nom d'utilisateur existe déjà" });
    }

    return res.status(500).json({ message: "Erreur serveur lors de l'inscription",erreur:error,error_mess:error.message });
  }
});

// Route de connexion
router.post("/login",express.json(), requestErrorHandler(async (req, res) => {
  const { email, password } = req.body;

  // Vérifier si l'utilisateur existe
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Identifiants invalides" });
  }

  // Vérifier le mot de passe
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Identifiants invalides" });
  }

  // Générer un token JWT
  const payload = {
    id: user.id
  };

  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
  res.status(201).json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name
    }
  });
}));

// Route de validation de token (utilisée par la gateway)
router.post("/verify-token", requestErrorHandler(async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(401).json({ valid: false, message: "Aucun token fourni" });
  }
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  res.json({ valid: true, user: decoded });
}));

// Nouvelle route pour récupérer tous les utilisateurs (protégée)
router.get('/', auth, requestErrorHandler(async (req, res) => {
  const users = await User.find({}, 'id username email name bio');
  res.json(users);
}));

module.exports = router;