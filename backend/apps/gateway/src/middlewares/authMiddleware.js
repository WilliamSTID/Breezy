const axios = require("axios");
const authServiceUrl =
    process.env.AUTH_SERVICE_URL || "http://authentification:4005";

/* ────────────────────────────────────────────────────────── */
/*  1. Fonction qui interroge le micro-service d’auth          */
const verifyToken = async (req, res, next) => {
  try {
    // Récupère l’en-tête Authorization et enlève le "Bearer "
    const rawHeader = req.header("Authorization") || "";
    const token     = rawHeader.split(" ")[1];           // "Bearer abc" → "abc"

    if (!token) {
      return res
          .status(401)
          .json({ message: "Accès refusé. Aucun token fourni." });
    }

    // Vérifie le token auprès du service d’authentification
    const { data } = await axios.post(
        `${authServiceUrl}/api/auth/verify-token`,
        { token }
    );

    if (data.valid) {
      req.user = data.user;                              // Info dispo pour les proxys
      return next();
    }

    return res.status(401).json({ message: "Token invalide." });
  } catch (error) {
    console.error("Erreur de vérification du token :", error.message);
    return res
        .status(401)
        .json({ message: "Token invalide ou expiré." });
  }
};

/* ────────────────────────────────────────────────────────── */
/*  2. Déclaration des routes publiques                       */
const publicRoutes = [
  { path: "/api/auth/login",    method: "POST" },
  { path: "/api/auth/register", method: "POST" },
  { path: "/",                  method: "GET"  },
];

/* ────────────────────────────────────────────────────────── */
/*  3. Middleware principal                                   */
const authMiddleware = (req, res, next) => {
  /* ⬇⬇⬇  Ajout essentiel pour CORS  ⬇⬇⬇ */
  if (req.method === "OPTIONS") {
    // Les requêtes de pré-vol doivent toujours passer
    return next();
  }
  /* ⬆⬆⬆  -------------------------  ⬆⬆⬆ */

  // Vérifie si la route est publique
  const isPublic = publicRoutes.some(
      (r) => r.path === req.path && r.method === req.method
  );

  if (isPublic) {
    return next();
  }

  // Pour toutes les autres routes, on valide le token
  return verifyToken(req, res, next);
};

module.exports = authMiddleware;
