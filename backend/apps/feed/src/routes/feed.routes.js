const express = require('express');
const authenticateToken = require('../../../libs/auth/authenticateToken');
const User = require('../models/User');
const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  const users = await User.find({}, { username: 1, _id: 0 });
  res.json(users);
});

module.exports = router;