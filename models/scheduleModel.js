const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  mealName: {
    type: String,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // Validates time format HH:MM
  },
  endTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // Validates time format HH:MM
  },
  isFor: {
    type: String,
    enum: ['Cafe Only', 'Non Cafe Only', 'Both'], // Restricts values to the dropdown options
    required: true,
  },
  isExtended: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

const Schedule = mongoose.model('Schedule', ScheduleSchema);

module.exports = Schedule;
