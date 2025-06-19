const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user.routes');
const app = express();

app.use(express.json());
app.use('/api/users', userRoutes);

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('MongoDB connecté');
  app.listen(4008, () => {
    console.log('feed service running on port 4008');
  });
})
.catch(err => {
  console.error('Erreur de connexion MongoDB', err);
});