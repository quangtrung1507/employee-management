const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee'); // Đổi tên model
const multer = require('multer');
const path = require('path');

// Cấu hình Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Thư mục lưu file
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Tên file duy nhất
  },
});
const upload = multer({ storage: storage });

// Trang chủ: hiển thị danh sách nhân viên
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.render('index', { employees }); // Truyền danh sách nhân viên
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Thêm nhân viên mới
router.post('/employees', upload.single('profileImage'), async (req, res) => {
  const { name, email, age, salary } = req.body;

  if (!name || !email || !age || !salary) {
    return res.status(400).json({ error: 'Tất cả các trường đều bắt buộc.' });
  }

  const ageNum = parseInt(age);
  const salaryNum = parseFloat(salary);

  if (isNaN(ageNum) || isNaN(salaryNum)) {
    return res.status(400).json({ error: 'Tuổi và Lương phải là số hợp lệ.' });
  }

  try {
    const newEmployee = new Employee({
      name,
      email,
      age: ageNum,
      salary: salaryNum,
      profileImage: req.file ? `/uploads/${req.file.filename}` : null, // Lưu đường dẫn ảnh
    });

    await newEmployee.save();
    res.redirect('/');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sửa thông tin nhân viên
router.get('/employees/:id/edit', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    res.render('edit', { employee }); // Truyền thông tin nhân viên
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/employees/:id', upload.single('profileImage'), async (req, res) => {
  const { name, email, age, salary } = req.body;

  const updateData = {
    name,
    email,
    age: parseInt(age),
    salary: parseFloat(salary),
  };

  if (req.file) {
    updateData.profileImage = `/uploads/${req.file.filename}`; // Cập nhật ảnh nếu có
  }

  try {
    await Employee.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.redirect('/');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Xóa nhân viên
router.get('/employees/:id/delete', async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.redirect('/');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
