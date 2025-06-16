const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use('/followers', createProxyMiddleware({ target: 'http://followers:4002', changeOrigin: true }));
app.use('/publicprofile', createProxyMiddleware({ target: 'http://publicprofile:4001', changeOrigin: true }));
app.use('/userprofile', createProxyMiddleware({ target: 'http://userprofile:4003', changeOrigin: true }));
app.use('/useraccount', createProxyMiddleware({ target: 'http://useraccount:4004', changeOrigin: true }));
app.use('/authentification', createProxyMiddleware({ target: 'http://authentification:4005', changeOrigin: true }));
app.use('/post', createProxyMiddleware({ target: 'http://post:4006', changeOrigin: true }));
app.use('/interaction', createProxyMiddleware({ target: 'http://interaction:4007', changeOrigin: true }));
app.use('/feed', createProxyMiddleware({ target: 'http://feed:4008', changeOrigin: true }));

app.get('/', (req, res) => {
  res.send('API Gateway is running');
});

app.listen(4000, () => {
  console.log('API Gateway running on port 4000');
});