const express = require('express');
const mongoose = require('mongoose');
const path = require('path'); // Import the path module correctly
const studentRoutes = require('./controllers/studentController').router; 
require('dotenv').config(); 
const cors = require('cors');


const app = express();

// Connect to MongoDB
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    // Start the server
    app.listen(PORT, () => {
        console.log(`Server started on http://localhost:${PORT}`);
        console.log(`Server running on port ${PORT} , and connected to DB`);
    });
})
.catch((error) => {
    console.error('Database connection error:', error);
});

// Middleware to serve static files (for HTML form)
app.use(express.static(path.join(__dirname, 'views'))); // Ensure this points to your views directory

// Serve static files from the 'photos' directory
app.use('/photos', express.static(path.join(__dirname, 'photos')));

// Middleware to handle JSON data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(cors());
// Use student routes
app.use('/', studentRoutes);


// Serve static files from the 'public' folder
app.use(express.static('views'));