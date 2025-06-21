const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Accès non autorisé. Token requis.' });
  }
  
  // Utiliser la variable d'environnement JWT_SECRET
  const secret = process.env.JWT_SECRET;
  console.log("Vérification du token avec secret défini:", !!secret);
  
  jwt.verify(token, secret, (err, user) => {
    if (err) {
      console.error("Erreur de vérification du token:", err.message);
      return res.status(403).json({ message: 'Token invalide ou expiré.' });
    }
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;