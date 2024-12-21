const Schedule = require('../models/scheduleModel');
const express = require('express');
const router = express.Router();



//add schedule
router.get('/schedules', async (req, res) => {
    try {
        const schedules = await Schedule.find(); // Fetch schedules from the database
        res.json(schedules); // Pass data to the EJS view
    }catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).json({ error: 'Failed to fetch students' });
    }
  });
  
  router.post('/schedules', async (req, res) => {
    try {
      const { mealName, startTime, endTime, isFor, isExtended } = req.body;
  
      const newSchedule = new Schedule({
        mealName,
        startTime,
        endTime,
        isFor,
        isExtended: isExtended || false, // defaults to false if unchecked
      });
  
      await newSchedule.save();
      res.status(201).json({ message: 'Schedule created successfully', schedule: newSchedule });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  

  module.exports = {
    upload,
    uploadFile,
    generateIdCard,
    getAllSchedule: router.get.bind(router),
    router
  }