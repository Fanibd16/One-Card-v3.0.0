const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const scheduleController = require('../controllers/scheduleController');

// Define the route for file upload
router.post('/upload', studentController.upload.single('file'), studentController.uploadFile);



// router.get('/schedules', scheduleController.getAllscheduleController); // Define a route to get students?

// New route for fetching all students
router.get('/students', studentController.getAllStudents); // Define a route to get students
// router.get('/generate-id-cards', studentController.getAllStudents); // Define a route to get students

module.exports = router;


