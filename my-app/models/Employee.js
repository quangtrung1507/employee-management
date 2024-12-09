const mongoose = require('mongoose');

// Định nghĩa Schema cho Employee
const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  age: { type: Number, required: true },
  salary: { type: Number, required: true },
  profileImage: { type: String } // Lưu đường dẫn ảnh
});

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
