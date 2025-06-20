require('dotenv').config();
const { createProxyMiddleware } = require('http-proxy-middleware');
const express = require('express');
const app = express();

const PORT = process.env.PORT || 4000;

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
    target: 'http://userprofile:4003',
    pathRewrite: (path) => path.replace('/api/users/profile', '/userprofile'),
  },
  {
    path: '/api/users',
    target: 'http://useraccount:4004',
  },
  {
    path: '/api/posts',
    target: 'http://post:4006',
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