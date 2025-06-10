const express = require('express');
const mongoose = require('mongoose');
const User = require('../src/models/User');

const app = express();
const PORT = process.env.PORT || 4001;

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/breezy');

app.get('/profile/:username', async (req, res) => {
  try {
    const user = await User.findOne(
      { username: req.params.username },
      'username bio avatar createdAt updatedAt'
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`publicProfile service running on port ${PORT}`);
});