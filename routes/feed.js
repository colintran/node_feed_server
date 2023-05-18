const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feed');

router.get('/feeds',feedController.getFeeds);
router.post('/feeds',feedController.postFeed);

module.exports = router;