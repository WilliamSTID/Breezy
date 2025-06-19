const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user.routes');
const app = express();

app.use(express.json());
app.use('/api/users', userRoutes);

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('MongoDB connecté');
  app.listen(4007, () => {
    console.log('interaction service running on port 4007');
  });
})
.catch(err => {
  console.error('Erreur de connexion MongoDB', err);
});