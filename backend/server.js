const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://wwww:wwww@cluster0.u2hhi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => console.log('MongoDB connected successfully'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Define Mongoose Schemas
const studentSchema = new mongoose.Schema({
  name: String,
  id: String,
  email: String,
  password: String,
  batch: String,
  encoding: [Number] // Array to store the face encoding
});

const teacherSchema = new mongoose.Schema({
  name: String,
  id: String,
  email: String,
  password: String,
});

const Student = mongoose.model('Student', studentSchema);
const Teacher = mongoose.model('Teacher', teacherSchema);

// API Endpoints
app.post('/api/students/register', async (req, res) => {
  const { name, id, email, password, batch, encoding } = req.body;

  try {
    const student = new Student({ name, id, email, password, batch, encoding });
    await student.save();
    res.status(201).send('Student registered successfully.');
  } catch (error) {
    res.status(500).send('Error registering student: ' + error);
  }
});

app.post('/api/teachers/register', async (req, res) => {
  try {
    const teacher = new Teacher(req.body);
    await teacher.save();
    res.status(201).send('Teacher registered successfully.');
  } catch (error) {
    res.status(500).send('Error registering teacher: ' + error);
  }
});

app.post('/api/students/login', async (req, res) => {
  const { id, password } = req.body;

  try {
    const student = await Student.findOne({ id, password });
    if (!student) return res.status(401).send('Invalid credentials');

    res.status(200).json(student); // Send student data to the client
  } catch (error) {
    res.status(500).send('Error logging in student: ' + error);
  }
});

app.post('/api/teachers/login', async (req, res) => {
  const { id, password } = req.body;

  try {
    const teacher = await Teacher.findOne({ id, password });
    if (!teacher) return res.status(401).send('Invalid credentials');

    res.status(200).json(teacher); // Send teacher data to the client
  } catch (error) {
    res.status(500).send('Error logging in teacher: ' + error);
  }
});

// Trigger face recognition and update attendance
app.get('/api/start_attendance', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5001/start_attendance');
    const recognizedStudents = response.data.recognized_students;

    // Update attendance for recognized students in the database
    recognizedStudents.forEach(async (studentName) => {
      await Student.updateOne({ name: studentName }, { $set: { attendance: true } });
    });

    res.status(200).json({ message: 'Attendance marked successfully.', recognizedStudents });
  } catch (error) {
    res.status(500).send('Error starting attendance: ' + error);
  }
});

// Start server
app.listen(5000, () => console.log('Server started on http://localhost:5000'));
