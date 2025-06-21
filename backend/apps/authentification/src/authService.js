const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcrypt');
const axios = require('axios');
const User = require('./models/User');

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
const JWT_EXPIRES_IN = '24h';
const SALT_ROUNDS = 10;

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connecté'))
.catch(err => console.error('Erreur de connexion MongoDB:', err));

class AuthService {
  // Inscription d'un nouvel utilisateur
  async register(email, password, username) {
    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return { success: false, message: 'Cet email est déjà utilisé' };
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      // Créer un nouvel utilisateur dans le service d'authentification
      const user = new User({
        email,
        password: hashedPassword,
        username
      });

      await user.save();

      // Créer l'utilisateur dans le service UserAccount
      try {
        await axios.post('http://useraccount:4004/internal/create-user', {
          userId: user._id,
          username,
          email
        });
      } catch (error) {
        // Si l'appel à UserAccount échoue, on pourrait :
        // 1. Supprimer l'utilisateur créé dans Auth
        // 2. Ou implémenter un système de compensation (compensation pattern)
        console.error('Erreur lors de la création du compte utilisateur:', error);
      }

      // Générer un token
      const token = this.generateToken(user);

      return {
        success: true,
        data: {
          token,
          user: {
            id: user._id,
            email: user.email,
            username: user.username
          }
        }
      };
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      return { success: false, message: 'Erreur lors de l\'inscription' };
    }
  }

  // Connexion d'un utilisateur existant
  async login(email, password) {
    try {
      // Vérifier si l'utilisateur existe
      const user = await User.findOne({ email });
      if (!user) {
        return { success: false, message: 'Identifiants invalides' };
      }

      // Vérifier le mot de passe
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return { success: false, message: 'Identifiants invalides' };
      }

      // Générer un token
      const token = this.generateToken(user);

      return {
        success: true,
        data: {
          token,
          user: {
            id: user._id,
            email: user.email,
            username: user.username
          }
        }
      };
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return { success: false, message: 'Erreur lors de la connexion' };
    }
  }

  // Vérification d'un token
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return { success: true, data: { user: decoded } };
    } catch (error) {
      console.error('Token invalide:', error);
      return { success: false, message: 'Token invalide ou expiré' };
    }
  }

  // Génération d'un token JWT
  generateToken(user) {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  // Middleware d'authentification
  authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Accès non autorisé. Token requis.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Token invalide' });
      }
      req.user = user;
      next();
    });
  }
}

module.exports = new AuthService();