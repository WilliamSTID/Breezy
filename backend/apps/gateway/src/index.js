const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Routes existantes
app.use('/followers', createProxyMiddleware({ target: 'http://followers:4002', changeOrigin: true }));
app.use('/publicprofile', createProxyMiddleware({ target: 'http://publicprofile:4001', changeOrigin: true }));
app.use('/userprofile', createProxyMiddleware({ target: 'http://userprofile:4003', changeOrigin: true }));
app.use('/useraccount', createProxyMiddleware({ target: 'http://useraccount:4004', changeOrigin: true }));
app.use('/authentification', createProxyMiddleware({ target: 'http://authentification:4005', changeOrigin: true }));
app.use('/post', createProxyMiddleware({ target: 'http://post:4006', changeOrigin: true }));
app.use('/interaction', createProxyMiddleware({ target: 'http://interaction:4007', changeOrigin: true }));
app.use('/feed', createProxyMiddleware({ target: 'http://feed:4008', changeOrigin: true }));
app.use('/auth', createProxyMiddleware({
  target: 'http://authentification:4005',
  changeOrigin: true,
  pathRewrite: {
    '^/auth': ''
  }
}));
app.use('/users', createProxyMiddleware({
  target: 'http://useraccount:4004',
  changeOrigin: true
}));

// Nouvelles routes avec préfixe /api
app.use('/api/followers', createProxyMiddleware({ target: 'http://followers:4002', changeOrigin: true }));
app.use('/api/publicprofile', createProxyMiddleware({ target: 'http://publicprofile:4001', changeOrigin: true }));
app.use('/api/userprofile', createProxyMiddleware({ target: 'http://userprofile:4003', changeOrigin: true }));
app.use('/api/useraccount', createProxyMiddleware({ target: 'http://useraccount:4004', changeOrigin: true }));
app.use('/api/authentification', createProxyMiddleware({ target: 'http://authentification:4005', changeOrigin: true }));
app.use('/api/post', createProxyMiddleware({ target: 'http://post:4006', changeOrigin: true }));
app.use('/api/interaction', createProxyMiddleware({ target: 'http://interaction:4007', changeOrigin: true }));
app.use('/api/feed', createProxyMiddleware({ target: 'http://feed:4008', changeOrigin: true }));

// Route spécifique pour user/profile
app.use('/api/user/profile', createProxyMiddleware({
  target: 'http://userprofile:4003',
  changeOrigin: true,
  pathRewrite: {
    '^/api/user/profile': '/profile'
  }
}));

app.get('/', (req, res) => {
  res.send('API Gateway is running');
});

app.listen(4000, () => {
  console.log('API Gateway running on port 4000');
});