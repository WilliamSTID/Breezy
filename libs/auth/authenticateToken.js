const axios = require('axios');
const jwt = require('jsonwebtoken');

/**
 * Middleware pour vérifier le token d'authentification
 * Ce middleware communique avec le service d'authentification pour valider le token
 */
function authenticateToken(req, res, next) {
  // Récupérer le token d'autorisation
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
  
  if (!token) {
    return res.status(401).json({ message: 'Token d\'authentification manquant' });
  }

  // Option 1: Validation locale du token (plus rapide, moins de dépendances)
  try {
    // Utilisation d'une clé secrète partagée - assurez-vous qu'elle est identique à celle du service d'authentification
    const secret = process.env.JWT_SECRET || 'votre_clé_secrète_par_défaut';
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    // Si la vérification locale échoue, essayer avec le service d'authentification
    verifyWithAuthService(token, req, res, next);
  }
}

/**
 * Fonction auxiliaire pour vérifier le token avec le service d'authentification
 */
async function verifyWithAuthService(token, req, res, next) {
  try {
    // Appel au service d'authentification pour vérifier le token
    const response = await axios.post('http://authentification:4005/auth/verify', { token });
    
    if (response.data.valid) {
      req.user = response.data.user;
      next();
    } else {
      res.status(403).json({ message: 'Token invalide' });
    }
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error.message);
    res.status(500).json({ message: 'Erreur de serveur lors de l\'authentification' });
  }
}

module.exports = authenticateToken;