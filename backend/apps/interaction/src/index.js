const express = require('express');
const mongoose = require('mongoose');
const interactionRoutes = require('./routes/interaction.routes');

const app = express();
app.use(express.json());
app.use('/', interactionRoutes);

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/breezy')
  .then(() => app.listen(4007, () => console.log('interaction service running on port 4007')))
  .catch(err => console.error(err));