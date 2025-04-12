const express = require('express');
const router = express.Router();
const { fetchData } = require('../controllers/fetchController');

router.post('/fetch-data', fetchData);

module.exports = router;
