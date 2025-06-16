const express = require('express');
const router = express.Router();
const controller = require('../controllers/feed.controller');

router.get('/:userId', controller.getFeed);

module.exports = router;