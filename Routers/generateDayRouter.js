// routes/generateDayRouter.js

const express = require('express');
const { generateDayController } = require('../Controllers/generateDayController');
const router = express.Router();


// Define the routes and map them to the corresponding controller functions
router.post('/generate-day', generateDayController);


// Add more routes as needed

module.exports = router;
