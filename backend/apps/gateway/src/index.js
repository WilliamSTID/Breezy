require('dotenv').config();
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();

const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: "http://localhost:3000",              // ⬅ front autorisé (mets ton domaine en prod)
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true                             // si tu passes cookies/session
}));

// Répond correctement aux pré-vols OPTIONS
app.options("*", cors());

// Proxy AVANT tout body-parser !
app.use('/api/auth', express.json()); // Ajoute ce middleware AVANT le proxy
app.use('/api/auth', createProxyMiddleware({
  target: 'http://authentification:4005',
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '/api/auth' },
  selfHandleResponse: false,
  onProxyReq: (proxyReq, req, res) => {
    // Si le body existe, le forwarder manuellement
    if (req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  }
}));

app.use('/api/publicprofile', createProxyMiddleware({
  target: 'http://publicprofile:4001',
  changeOrigin: true
}));

// Place AVANT :
app.use('/api/users/profile', createProxyMiddleware({
  target: 'http://userprofile:4003/userprofile',
  changeOrigin: true,
  pathRewrite: { '^/api/users/profile': '' }
}));

// Puis ensuite :
// app.use('/api/users', createProxyMiddleware({
//   target: 'http://authentification:4005',
//   changeOrigin: true,
//   pathRewrite: { '^/api/users': '/api/users' }
// }));

// Si tu as des routes locales à la gateway, tu peux parser le body APRÈS
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// Configuration des autres proxies
const serviceRoutes = [
  {
    path: '/api/followers',
    target: 'http://followers:4002',
  },
  {
    path: '/api/users/profile',
    target: 'http://userprofile:4003/userprofile',
    pathRewrite: { '^/api/users/profile': '' },
  },
  {
    path: '/api/users',
    target: 'http://userprofile:4003/userprofile',
    pathRewrite: { '^/api/users': '' },
    onProxyReq: (proxyReq, req) => {
      console.log("🔁 Gateway envoie vers /userprofile/me");
      if (req.user?.id) {
        proxyReq.setHeader('X-User-Id', req.user.id);
      }
    }
  },

  {
    path: '/api/account',
    target: 'http://useraccount:4009/useraccount',
    pathRewrite: { '^/api/account': '' },
    onProxyReq: (proxyReq, req) => {
      if (req.user?.id) {
        proxyReq.setHeader('X-User-Id', req.user.id);
      }
    }
  },
  {
    path: '/api/posts',
    target: 'http://post:4006',
    pathRewrite: { '^/api/posts': '/api/posts' }
  },
  {
    path: '/api/interactions',
    target: 'http://interaction:4007',
  },
  {
    path: '/api/feed',
    target: 'http://feed:4008',
    pathRewrite: (path) => path.replace('/api/feed', '/feed'),
  }
];

// Middleware d'authentification global
app.use((req, res, next) => {
  if (req.path === '/' || req.path.startsWith('/api/publicprofile')) {
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  console.log("📩 Token reçu dans Gateway :", token);

  jwt.verify(token, process.env.JWT_SECRET || 'votre_secret', (err, user) => {
    if (err) {
      console.log("❌ Token invalide :", err.message);
      return res.status(403).json({ message: 'Token invalide' });
    }

    console.log("✅ Utilisateur identifié :", user);
    req.user = user;
    next(); // ← c'est ce next() qui laisse passer la requête au proxy
  });
});


// Setup proxies
serviceRoutes.forEach(route => {
  app.use(
      route.path,
      createProxyMiddleware({
        target: route.target,
        changeOrigin: true,
        pathRewrite: route.pathRewrite || (path => path.replace(route.path, '')),
        timeout: 120000,
        proxyTimeout: 120000,
        onProxyReq: route.onProxyReq // ⬅️ ajoute ceci
      })
  );
});
// Route de test
app.get('/', (req, res) => {
  res.send('API Gateway is running! 🌐');
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});

console.log('JWT_SECRET:', process.env.JWT_SECRET);