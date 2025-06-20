const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// App setup
const app = express();
const PORT = process.env.PORT || 4005;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Augmenter les limites pour les requêtes
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Timeout court pour le développement
app.use((req, res, next) => {
  req.setTimeout(60000, () => {
    console.log('Request timeout detected');
  });
  res.setTimeout(60000, () => {
    console.log('Response timeout detected');
    if (!res.headersSent) {
      res.status(408).send('Request Timeout');
    }
  });
  next();
});

// Ajouter des mesures de performance
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  next(); // Ce next() est crucial et manquait avant
});

// Middleware de débogage
app.use((req, res, next) => {
  const requestId = Date.now();
  console.log(`[${requestId}] Début de la requête: ${req.method} ${req.path}`);
  
  const originalSend = res.send;
  res.send = function(data) {
    console.log(`[${requestId}] Fin de la requête: ${req.method} ${req.path} - Status: ${res.statusCode}`);
    return originalSend.call(this, data);
  };
  
  next();
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error(`Erreur non gérée: ${req.method} ${req.path}`, err);
  res.status(500).json({ message: "Erreur serveur interne" });
});

// Middleware pour maintenir la connexion HTTP active pour les requêtes longues
app.use((req, res, next) => {
  if (req.path === '/register' || req.path === '/login') {
    const keepAliveInterval = setInterval(() => {
      if (!res.headersSent) {
        res.write(': keep-alive\n\n');
      }
    }, 15000);
    res.on('finish', () => clearInterval(keepAliveInterval));
    res.on('close', () => clearInterval(keepAliveInterval));
  }
  next();
});

// Routes - APRÈS le middleware keep-alive
const authRoutes = require("./routes/auth.routes.js");
const userRoutes = require("./routes/user.routes.js");

// Application des routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connecté"))
  .catch((err) => console.error("Erreur MongoDB :", err));

// Test route
app.get("/", (req, res) => {
  res.send("Breezy API is running 🌀");
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});