const mongoose = require('mongoose');
const User = require('../src/models/User');

mongoose.connect('mongodb://localhost:27017/breezy');

const user = new User({
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123'
});

user.save().then(u => {
  console.log('User created:', u);
  mongoose.disconnect();
});