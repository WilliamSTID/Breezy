const axios = require('axios');
const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://authentification:4005';

// Middleware qui vérifie le token JWT auprès du service d'authentification
const verifyToken = async (req, res, next) => {
  try {
    // Récupérer le token depuis le header
    const token = req.header('Authorization');
    
    if (!token) {
      return res.status(401).json({ message: "Accès refusé. Aucun token fourni." });
    }

    // Vérifier le token auprès du service d'authentification
    const response = await axios.post(`${authServiceUrl}/api/auth/verify-token`, { token });
    
    if (response.data.valid) {
      // Ajouter les informations utilisateur à la requête
      req.user = response.data.user;
      next();
    } else {
      return res.status(401).json({ message: "Token invalide." });
    }
  } catch (error) {
    console.error("Erreur de vérification du token:", error.message);
    return res.status(401).json({ message: "Token invalide ou expiré." });
  }
};

// Routes publiques qui ne nécessitent pas d'authentification
const publicRoutes = [
  { path: '/api/auth/login', method: 'POST' },
  { path: '/api/auth/register', method: 'POST' },
  { path: '/', method: 'GET' }
];

// Middleware qui vérifie si la route est publique ou nécessite une authentification
const authMiddleware = (req, res, next) => {
  // Vérifier si la route est publique
  const isPublicRoute = publicRoutes.some(
    route => route.path === req.path && route.method === req.method
  );
  
  if (isPublicRoute) {
    return next();
  }
  
  // Si la route n'est pas publique, vérifier le token
  return verifyToken(req, res, next);
};

module.exports = authMiddleware;