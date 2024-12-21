const mongoose = require('mongoose');

// Define the Student schema
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  department: { type: String, required: true },
  contact: { type: String, required: true },
  id: { type: String, required: true },
  status: { type: String, required: true },
  photoPath: { type: String, required: true},
  barCode :{type : String},
  meal :{type : String, required: true },
  idCardPath :{type : String}
});

// Export the Student model
const Student = mongoose.model('Student', studentSchema);

module.exports = Student;




