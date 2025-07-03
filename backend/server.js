const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const { Schema } = mongoose; // Destructuring to get Schema from mongoose
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const app = express();
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_jwt_secret_key'; 

mongoose.connect('Mongodb-uri')
    .then(() => console.log('MongoDB connected successfully'))
    .catch((err) => console.error('MongoDB connection error:', err));

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

app.use(cors({
  origin: 'http://localhost:3000', // Adjust according to your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware to authenticate token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401); // If no token is provided

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // If token is invalid

    req.user = user; // Attach user object to the request
    next(); // Proceed to the next middleware/route handler
  });
}

// Define Mongoose Schemas
// Student Schema
const studentSchema = new mongoose.Schema({
  name: String,
  id: String,
  email: String,
  password: String,
  batch: String,
  course: String,
  encoding: Array,
  inClass: [{ type: Schema.Types.ObjectId, ref: 'Class' }],
  events: [
    {
      eventType: { type: String },  // e.g., "personal"
      eventText: { type: String },
      eventDate: { type: Date },
      createdAt: { type: Date, default: Date.now }
    }
  ],
});


const teacherSchema = new mongoose.Schema({
  name: String,
  id: String,
  email: String,
  password: String,
});

const classSchema = new mongoose.Schema({
  semester: { type: String, required: true },
  batch: { type: String, required: true },
  college: { type: String, required: true },
  course: { type: String, required: true },
  subjectCode: { type: String, required: true },
  subjectLevel: { type: String, required: true },
  subject: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  studentList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  events: [
    {
      eventType: { type: String },  // e.g., "announcement" or "personal"
      eventText: { type: String },
      eventDate: { type: Date },
      createdAt: { type: Date, default: Date.now },
      createdBy: { type: Schema.Types.ObjectId, ref: 'Teacher' }
    }
  ],
}, { timestamps: true });


const attendanceSchema = new mongoose.Schema({
  classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  dateOfFirstEntry: { type: Date, default: Date.now, required: true },
  present: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
  absent: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
  leave: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
  request: [{
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    requestType: { type: String, required: true, enum: ['present', 'absent', 'leave'] }
  }]
}, { timestamps: true });

const Class = mongoose.model('Class', classSchema);
const Student = mongoose.model('Student', studentSchema);
const Teacher = mongoose.model('Teacher', teacherSchema);
const Attendance = mongoose.model('Attendance', attendanceSchema);

// In-memory store for logged-in users (both teachers and students)
const loggedInUsers = {};

// Register Student
// Register Student
app.post('/api/students/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Prepare new student data including face encoding
    const newStudent = new Student({ 
      name: req.body.name,
      id: req.body.id,
      email: req.body.email,
      password: hashedPassword,
      batch: req.body.batch,
      course: req.body.course,
      encoding: req.body.encoding // Ensure encoding comes from request body
    });

    await newStudent.save(); // MongoDB generates _id here
    res.status(200).send('Student registered successfully.');
  } catch (error) {
    res.status(500).send('Error registering student: ' + error);
  }
});


// Register Teacher
app.post('/api/teachers/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newTeacher = new Teacher({ ...req.body, password: hashedPassword });
    await newTeacher.save();
    res.status(200).send('Teacher registered successfully.');
  } catch (error) {
    res.status(500).send('Error registering teacher.');
  }
});

// Student Login
app.post('/api/students/login', async (req, res) => {
  const { id, password } = req.body;

  try {
    const student = await Student.findOne({ id });
    if (!student || !(await bcrypt.compare(password, student.password))) {
      return res.status(401).send('Invalid credentials');
    }

    // Generate a JWT token for the student
    const token = jwt.sign({ studentId: student._id }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token, studentId: student._id });
  } catch (error) {
    res.status(500).send('Error logging in student: ' + error);
  }
});


app.post('/api/teachers/login', async (req, res) => {
  const { id, password } = req.body;

  try {
    const teacher = await Teacher.findOne({ id });
    if (!teacher || !(await bcrypt.compare(password, teacher.password))) {
      return res.status(401).send('Invalid credentials'); // Only one response sent here
    }

    const token = jwt.sign({ teacherId: teacher._id }, JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({ token, id: teacher.id }); // Ensure no further response after this
  } catch (error) {
    console.error('Error logging in teacher:', error);
    return res.status(500).send('Error logging in teacher: ' + error);
  }
});


// Update Teacher Profile
app.put('/api/teachers/edit/:id', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const updatedTeacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      { name, email, password },
      { new: true }
    );

    res.status(200).json({ message: 'Profile updated successfully', updatedTeacher });
  } catch (error) {
    res.status(500).send('Error updating profile: ' + error);
  }
});


app.post('/api/classes/create', authenticateToken, async (req, res) => {
  const { semester, batch, college, course, subjectCode, subjectLevel, subject, studentList } = req.body;

  try {
    // Step 1: Create the new class
    const newClass = new Class({
      semester,
      batch,
      college,
      course,
      subjectCode,
      subjectLevel,
      subject,
      createdBy: req.user.teacherId,
      studentList,
    });

    console.log('Creating class with:', newClass);
    await newClass.save(); // Save to the database

    // Step 2: Update the `inClass` field for students in the list
    const updateResult = await Student.updateMany(
      { _id: { $in: studentList } }, // Match students whose IDs are in the list
      { $push: { inClass: newClass._id } } // Push the class ID to their inClass array
    );

    console.log('Students updated:', updateResult);

    // Respond with success
    res.status(201).json({
      message: 'Class created successfully and students updated',
      class: newClass,
      updatedStudents: updateResult.modifiedCount,
    });
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).json({ error: 'Failed to create class' });
  }
});


// Get Classes by Teacher ID
app.get('/api/classes/:teacherId', async (req, res) => {
  const { teacherId } = req.params;
  try {
    const classes = await Class.find({ createdBy: teacherId });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Students by Batch
app.get('/api/students/:batch', async (req, res) => {
  const { batch } = req.params;
  try {
    const students = await Student.find({ batch });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).send('Error fetching students: ' + error);
  }
});

// Get Classes for Authenticated Teacher
app.get('/api/classes', authenticateToken, async (req, res) => {
  try {
    const classes = await Class.find({ createdBy: req.user.teacherId });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch Students by Batch and Course
app.get('/api/students', async (req, res) => {
  const { batch, course } = req.query;

  try {
    const courseArray = typeof course === 'string' ? course.split(',') : course;
    const students = await Student.find({ batch, course: { $in: courseArray } });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).send('Error fetching students: ' + error);
  }
});

// Route to save face encoding
app.post('/api/save_face_encoding', async (req, res) => {
  const { student_id, encoding } = req.body;

  try {
      const student = await Student.findOne({ id: student_id });
      if (!student) {
          return res.status(404).send('Student not found');
      }

      student.encoding = encoding;  // Save encoding as an array
      await student.save();

      res.status(200).send('Face encoding saved successfully.');
  } catch (error) {
      res.status(500).send('Error saving face encoding: ' + error);
  }
});

// Fetch Classes for Student based on studentId
app.get('/api/student/classes/:studentId', async (req, res) => {
  const { studentId } = req.params;

  try {
    console.log('Fetching student with ID:', studentId);
    
    // Fetch student with classes they are enrolled in
    const student = await Student.findById(studentId).populate('inClass');
    if (!student) {
      console.log('Student not found');
      return res.status(404).json({ message: 'Student not found' });
    }

    console.log('Student found, fetching classes...');
    
    // Fetch the classes that the student is enrolled in
    const classes = await Class.find({ _id: { $in: student.inClass } }).populate('createdBy', 'name');

    // Calculate attendance percentage for each class
    const classesWithAttendance = await Promise.all(classes.map(async (course) => {
      const attendanceRecords = await Attendance.find({ classId: course._id });

      let totalDays = 0;
      let presentDays = 0;

      // Loop through the attendance records to count total days and present days
      attendanceRecords.forEach(record => {
        // Count total days (present, absent, or leave)
        if (record.present.includes(studentId) || record.absent.includes(studentId) || record.leave.includes(studentId)) {
          totalDays++;
        }
        // Count present days
        if (record.present.includes(studentId)) {
          presentDays++;
        }
      });

      // Calculate attendance percentage (if there are any attendance records)
      const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

      // Return the class data along with attendance percentage
      return {
        ...course.toObject(), // Convert Mongoose document to plain JavaScript object
        attendancePercentage
      };
    }));

    res.json(classesWithAttendance);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/events', authenticateToken, async (req, res) => {
  const { date, userId, classId, userType } = req.query;
  
  try {
    let events = [];
    if (userType === 'student') {
      const student = await Student.findById(userId);
      events = student.events.filter(event => event.eventDate.toISOString().split('T')[0] === date);
    } else if (userType === 'teacher') {
      const classData = await Class.findById(classId);
      events = classData.events.filter(event => event.eventDate.toISOString().split('T')[0] === date);
    }
    
    res.json(events);
  } catch (err) {
    res.status(500).send('Error fetching events');
  }
});

app.post('/api/events/create', authenticateToken, async (req, res) => {
  const { eventType, eventText, eventDate, userId, classId, userType } = req.body;

  try {
    if (userType === 'student') {
      const student = await Student.findById(userId);
      student.events.push({ eventType, eventText, eventDate });
      await student.save();
    } else if (userType === 'teacher') {
      const classData = await Class.findById(classId);
      classData.events.push({ eventType, eventText, eventDate, createdBy: userId });
      await classData.save();
    }
    res.status(201).send('Event created successfully');
  } catch (err) {
    res.status(500).send('Error creating event');
  }
});


app.get('/api/classes/:classId/students', async (req, res) => {
  const { classId } = req.params;
  
  try {
    // Find the class by ID and populate the student list
    const classData = await Class.findById(classId).populate('studentList');

    // If class not found
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Extract student details and their face encodings
    const students = classData.studentList.map(student => ({
      id: student._id.toHexString(),
      name: student.name,
      encoding: student.encoding // This should be the face encoding
    }));

    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).send('Error fetching students');
  }
});


// Route to mark attendance based on face comparison
app.post('/api/classes/:classId/mark-attendance', async (req, res) => {
  console.log("Received request for marking attendance");
  console.log("Params:", req.params);
  console.log("Body:", req.body);

  try {
    const { classId } = req.params;
    const { recognizedStudentIds } = req.body; // Array of recognized student IDs

    if (!recognizedStudentIds || !Array.isArray(recognizedStudentIds)) {
      return res.status(400).json({ success: false, message: "Invalid data format" });
    }

    // Fetch the class and its students
    const classData = await Class.findById(classId).populate('studentList');
    if (!classData) {
      return res.status(404).json({ success: false, message: "Class not found" });
    }

    // Identify students who were not recognized and mark them as absent
    const allStudentIds = classData.studentList.map(student => student._id.toString());
    const absentStudentIds = allStudentIds.filter(id => !recognizedStudentIds.includes(id));

    // Create a new attendance record
    const attendanceRecord = new Attendance({
      classId: classId,
      present: recognizedStudentIds,
      absent: absentStudentIds,
      dateOfFirstEntry: new Date() // or any other date you want to set
    });

    // Save the attendance record
    await attendanceRecord.save();

    return res.json({
      success: true,
      message: "Attendance marked successfully",
      presentStudents: recognizedStudentIds.length,
      absentStudents: absentStudentIds.length
    });
  } catch (error) {
    console.error("Error marking attendance:", error);
    return res.status(500).json({ success: false, message: "Failed to mark attendance" });
  }
});

// Get total students from Class Schema
app.get('/api/classes/:classId/students/count', async (req, res) => {
  const { classId } = req.params;
  try {
    const classData = await Class.findById(classId).populate('studentList');
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }
    const totalStudents = classData.studentList.length; // Get the total count of students
    res.json({ totalStudents });
  } catch (error) {
    console.error('Error fetching student count:', error);
    res.status(500).send('Error fetching student count');
  }
});


app.get('/api/attendances/:classId/:date', async (req, res) => {
  const { classId, date } = req.params;

  try {
    const formattedDate = new Date(date);

    // Validate date
    if (isNaN(formattedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    // Start of day (00:00:00)
// Convert date to UTC and set the time range explicitly
const startOfDay = new Date(Date.UTC(formattedDate.getUTCFullYear(), formattedDate.getUTCMonth(), formattedDate.getUTCDate(), 0, 0, 0));
const endOfDay = new Date(Date.UTC(formattedDate.getUTCFullYear(), formattedDate.getUTCMonth(), formattedDate.getUTCDate(), 23, 59, 59, 999));


    const attendanceData = await Attendance.findOne({
      classId,
      dateOfFirstEntry: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    })
    .populate('present')
    .populate('absent')
    .populate('leave')
    .populate('request');


    if (!attendanceData) {
      return res.status(404).json({ message: 'No attendance data found for this date' });
    }

    res.json(attendanceData);
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    res.status(500).json({ message: 'Error fetching attendance data' });
  }
});


app.get('/api/attendance/:classId', async (req, res) => {
  const { classId } = req.params;
  const { startDate, endDate } = req.query;

  try {
    const formattedStartDate = new Date(startDate);
    const formattedEndDate = new Date(endDate);

    // Validate dates
    if (isNaN(formattedStartDate.getTime()) || isNaN(formattedEndDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    // Convert dates to UTC and set the time range explicitly
    const startOfDay = new Date(Date.UTC(formattedStartDate.getUTCFullYear(), formattedStartDate.getUTCMonth(), formattedStartDate.getUTCDate(), 0, 0, 0));
    const endOfDay = new Date(Date.UTC(formattedEndDate.getUTCFullYear(), formattedEndDate.getUTCMonth(), formattedEndDate.getUTCDate(), 23, 59, 59, 999));

    // Find attendance data in the range
    const attendanceData = await Attendance.find({
      classId,
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    // Check if attendance data is found
    if (!attendanceData || attendanceData.length === 0) {
      return res.status(404).json({ message: 'No attendance data found for this date range' });
    }

    // Prepare response with the date and count of present students
    const attendanceSummary = attendanceData.map((record) => {
      return {
        date: record.dateOfFirstEntry.toISOString().split('T')[0], // Format the date as 'YYYY-MM-DD'
        presentCount: record.present.length // Count of present students
      };
    });

    res.json(attendanceSummary);
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    res.status(500).json({ message: 'Error fetching attendance data' });
  }
});

// Get Class Details including Subject, Batch, and Student List
app.get('/api/class/:classId/details', async (req, res) => {
  const { classId } = req.params;

  try {
    const classData = await Class.findById(classId)
      .populate('studentList', '_id id name course'); // Populates student list with specific fields

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Prepare response with subject, batch, and student list details
    const response = {
      subject: classData.subject,
      batch: classData.batch,
      students: classData.studentList.map(student => ({
        _id: student._id,
        id: student.id,
        name: student.name,
        course: student.course,

      }))
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching class details:', error);
    res.status(500).send('Error fetching class details');
  }
});

app.post('/api/attendance/update', async (req, res) => {
  const { classId, studentId, status, date } = req.body; // Extract date from request

  try {
    // Convert the incoming date to UTC format
    const formattedDate = new Date(date); // Convert the received date into a Date object

    // Validate the date format
    if (isNaN(formattedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const startOfDay = new Date(Date.UTC(formattedDate.getUTCFullYear(), formattedDate.getUTCMonth(), formattedDate.getUTCDate(), 0, 0, 0));
    const endOfDay = new Date(Date.UTC(formattedDate.getUTCFullYear(), formattedDate.getUTCMonth(), formattedDate.getUTCDate(), 23, 59, 59, 999));

    // Find the attendance document based on classId and the exact UTC date
    let attendance = await Attendance.findOne({
      classId,
      dateOfFirstEntry: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    // Prepare arrays for present, absent, leave, or request
    if (!attendance) {
      // If attendance record does not exist, create a new one
      attendance = new Attendance({
        classId,
        dateOfFirstEntry: formattedDate,
        present: [],
        absent: [],
        leave: [],
        request: []
      });
    }

    // Update attendance based on status
    if (status === 'present') {
      if (!attendance.present.includes(studentId)) {
        attendance.present.push(studentId);
      }
      attendance.absent = attendance.absent.filter(id => id.toString() !== studentId); // Ensure student is removed from absent
    } else if (status === 'absent') {
      if (!attendance.absent.includes(studentId)) {
        attendance.absent.push(studentId);
      }
      attendance.present = attendance.present.filter(id => id.toString() !== studentId); // Ensure student is removed from present
    } else if (status === 'leave') {
      if (!attendance.leave.includes(studentId)) {
        attendance.leave.push(studentId);
      }
      attendance.present = attendance.present.filter(id => id.toString() !== studentId);
      attendance.absent = attendance.absent.filter(id => id.toString() !== studentId); // Ensure student is removed from absent
    } else if (status === 'request') {
      if (!attendance.request.includes(studentId)) {
        attendance.request.push(studentId);
      }
    } else {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Save the attendance record
    await attendance.save();

    return res.status(200).json({
      success: true,
      message: 'Attendance updated successfully',
      attendance
    });
  } catch (error) {
    console.error('Error updating attendance:', error);
    return res.status(500).json({ success: false, message: 'Failed to update attendance' });
  }
});


app.get('/student/classes/:studentId', async (req, res) => {
  const { studentId } = req.params;

  try {
    console.log(`Fetching student with ID: ${studentId}`);
    // Add any other checks here
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    console.log('Student found, fetching classes...');
    const courses = await Course.find({ studentList: studentId });
    console.log('Classes fetched:', courses);

    if (!courses.length) {
      return res.status(404).json({ message: 'No classes found for this student.' });
    }

    res.json(courses);
  } catch (error) {
    console.error('Error fetching classes:', error);
    return res.status(500).json({ message: 'Error fetching classes.', error: error.message });
  }
});



// Fetch student's total attendance stats by classId and studentId
app.get('/api/attendance/stats/:classId/:studentId', async (req, res) => {
  const { classId, studentId } = req.params;

  try {
    // Fetch all attendance records for the specified class
    const attendanceRecords = await Attendance.find({ classId });

    if (!attendanceRecords.length) {
      return res.status(404).json({ message: 'No attendance records found for the given class.' });
    }

    // Initialize counters for each attendance category
    let totalClasses = 0;
    let presentCount = 0;
    let absentCount = 0;
    let leaveCount = 0;

    // Loop through each attendance record and count based on the studentId
    attendanceRecords.forEach(record => {
      totalClasses++;
      if (record.present.includes(studentId)) {
        presentCount++;
      } else if (record.absent.includes(studentId)) {
        absentCount++;
      } else if (record.leave.includes(studentId)) {
        leaveCount++;
      }
    });

    // Respond with the calculated stats
    res.json({
      classId,
      studentId,
      totalClasses,
      present: presentCount,
      absent: absentCount,
      leave: leaveCount
    });
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

app.get('/api/attendance/streak/:classId/:studentId', async (req, res) => {
  const { classId, studentId } = req.params;
  const { startDate, endDate } = req.query;

  try {
    // Validate and parse the date range
    const formattedStartDate = new Date(startDate);
    const formattedEndDate = new Date(endDate);

    if (isNaN(formattedStartDate) || isNaN(formattedEndDate)) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    // Fetch attendance records for the class and within the date range
    const attendanceRecords = await Attendance.find({
      classId,
      dateOfFirstEntry: {
        $gte: formattedStartDate,
        $lte: formattedEndDate,
      },
    }).sort({ dateOfFirstEntry: 1 }); // Sort by date ascending

    if (!attendanceRecords.length) {
      return res.status(404).json({ message: 'No attendance records found for the given range.' });
    }

    // Initialize streak calculation and attendance history
    let currentStreak = 0;
    let maxStreak = 0;
    let attendanceHistory = [];

    for (const record of attendanceRecords) {
      const date = record.dateOfFirstEntry.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
      const status = record.present.includes(studentId)
        ? 'present'
        : record.absent.includes(studentId)
        ? 'absent'
        : record.leave.includes(studentId)
        ? 'leave'
        : 'unknown';

      attendanceHistory.push({ date, status });

      // Update streak based on presence
      if (status === 'present') {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0; // Reset streak on absence or leave
      }
    }

    res.json({
      streak: currentStreak,
      attendanceHistory,
    });
  } catch (error) {
    console.error('Error calculating attendance streak:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

app.get('/api/attendance/calendar/:classId/:studentId', async (req, res) => {
  const { classId, studentId } = req.params;
  const { month, year } = req.query;
  console.log('Fetching attendance calendar for:', month, year);
  console.log(classId,studentId)
  try {
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, parseInt(month, 10) + 1, 0);

    // Fetch attendance records within the month
    const attendanceRecords = await Attendance.find({
      classId,
      dateOfFirstEntry: { $gte: startOfMonth, $lte: endOfMonth },
    });

    // Map attendance data
    const attendanceData = {};
    attendanceRecords.forEach((record) => {
      const dateKey = record.dateOfFirstEntry.toISOString().split('T')[0];

      if (record.present.includes(studentId)) {
        attendanceData[dateKey] = 'present';
      } else if (record.absent.includes(studentId)) {
        attendanceData[dateKey] = 'absent';
      } else if (record.leave.includes(studentId)) {
        attendanceData[dateKey] = 'leave';
      } else if (record.request.includes(studentId)) {
        attendanceData[dateKey] = 'request';
      }
    });

    res.json(attendanceData); // e.g., { '2024-12-01': 'present', '2024-12-02': 'absent' }
  } catch (error) {
    console.error('Error fetching attendance calendar data:', error);
    res.status(500).json({ error: 'Failed to fetch attendance data' });
  }
});


// Fetch attendance dates by classId
app.get('/attendance/dates/:classId', async (req, res) => {
  const { classId } = req.params;

  try {
    const attendanceRecords = await Attendance.find({ classId }, 'dateOfFirstEntry');
    if (!attendanceRecords.length) {
      return res.status(404).json({ message: 'No attendance records found for this class' });
    }
    res.json({ dates: attendanceRecords.map(record => record.dateOfFirstEntry) });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Add studentId to request array with the desired status
// Add student request
app.put('/attendance/request', async (req, res) => {
  const { classId, date, studentId, requestType } = req.body;

  if (!['present', 'absent', 'leave'].includes(requestType)) {
    return res.status(400).json({ error: 'Invalid request type' });
  }

  try {
    const attendanceRecord = await Attendance.findOne({ classId, dateOfFirstEntry: date });
    if (!attendanceRecord) {
      return res.status(404).json({ message: 'Attendance record not found for the specified date and class' });
    }

    const existingRequest = attendanceRecord.request.find(req => req.studentId.toString() === studentId);
    if (existingRequest) {
      existingRequest.requestType = requestType; // Update existing request
    } else {
      attendanceRecord.request.push({ studentId, requestType: requestType }); // Add new request
    }

    await attendanceRecord.save();
    res.json({ message: 'Request updated successfully', attendanceRecord });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Fetch attendance requests by classId
app.get('/teacher/attendance/requests/:classId', async (req, res) => {
  const { classId } = req.params;

  try {
    const attendanceRecords = await Attendance.find({ classId, 'request.0': { $exists: true } });
    if (!attendanceRecords.length) {
      return res.status(404).json({ message: 'No attendance requests found for this class' });
    }

    const result = await Promise.all(
      attendanceRecords.map(async (record) => {
        const requestsWithStudentDetails = await Promise.all(
          record.request.map(async (req) => {
            const student = await Student.findById(req.studentId).select('name _id');
            return {
              studentId: student._id,
              studentName: student.name,
              requestType: req.requestType,
              date: record.dateOfFirstEntry,
            };
          })
        );
        return requestsWithStudentDetails;
      })
    );

    res.json({ requests: result.flat() }); // Flatten the nested arrays
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Handle attendance request actions
app.put('/teacher/attendance/request/action', async (req, res) => {
  const { studentId, date, classId, requestType, action } = req.body;

  if (!['present', 'absent', 'leave'].includes(requestType)) {
    return res.status(400).json({ error: 'Invalid request type' });
  }

  if (!['accepted', 'rejected'].includes(action)) {
    return res.status(400).json({ error: 'Invalid action type' });
  }

  try {
    const attendanceRecord = await Attendance.findOne({ classId, dateOfFirstEntry: date });
    if (!attendanceRecord) {
      return res.status(404).json({ message: 'Attendance record not found for the specified date and class' });
    }

    if (action === 'accepted') {
      // Remove studentId from all attendance arrays
      ['present', 'absent', 'leave'].forEach((arrayName) => {
        attendanceRecord[arrayName] = attendanceRecord[arrayName].filter(
          (id) => id.toString() !== studentId
        );
      });

      // Add studentId to the appropriate array based on requestType
      attendanceRecord[requestType].push(studentId);
    }

    // Remove studentId from the request array
    attendanceRecord.request = attendanceRecord.request.filter(
      (req) => req.studentId.toString() !== studentId
    );

    await attendanceRecord.save();
    res.json({ message: 'Attendance updated successfully', attendanceRecord });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

const MONTHS = {
  January: 0,
  February: 1,
  March: 2,
  April: 3,
  May: 4,
  June: 5,
  July: 6,
  August: 7,
  September: 8,
  October: 9,
  November: 10,
  December: 11,
};

app.get('/attendance/class/:classId/month/:month', async (req, res) => {
  const { classId, month } = req.params;

  try {
    console.log('Fetching attendance for class:', classId, 'for month:', month);

    // Initialize date range variables
    let startDate, endDate;

    if (month === 'All') {
      console.log('Fetching full range of attendance data for class:', classId);

      // Get the full range of attendance data for this class
      const firstRecord = await Attendance.findOne({ classId: classId })
        .sort({ dateOfFirstEntry: 1 }) // Earliest date
        .select('dateOfFirstEntry')
        .lean();

      const lastRecord = await Attendance.findOne({ classId: classId })
        .sort({ dateOfFirstEntry: -1 }) // Latest date
        .select('dateOfFirstEntry')
        .lean();

      if (!firstRecord || !lastRecord) {
        console.log('No attendance records found for class:', classId);
        return res.status(404).json({ error: 'No attendance records found for this class.' });
      }

      startDate = new Date(firstRecord.dateOfFirstEntry);
      endDate = new Date(lastRecord.dateOfFirstEntry);
    } else {
      console.log('Parsing month parameter:', month);

      // Parse month parameter to calculate date range
      const currentYear = new Date().getFullYear(); // Use the current year if not specified
      const monthIndex = MONTHS[month];

      if (monthIndex === undefined) {
        console.log('Invalid month name:', month);
        return res.status(400).json({ error: 'Invalid month name. Provide a valid month.' });
      }

      startDate = new Date(currentYear, monthIndex, 1); // Start of the given month
      endDate = new Date(currentYear, monthIndex + 1, 0, 23, 59, 59); // End of the given month
    }

    console.log('Fetching attendance records from', startDate, 'to', endDate);

    // Fetch attendance records within the calculated date range
    const attendances = await Attendance.find({
      classId: classId,
      dateOfFirstEntry: { $gte: startDate, $lte: endDate },
    })
      .populate('present absent leave', 'name id') // Include student details for attendance
      .lean();

    console.log('Attendance records fetched:', attendances.length);

    // Fetch class details
    const classDetails = await Class.findById(classId)
      .populate('studentList', 'name id batch course') // Populate student details
      .populate('createdBy', 'name email') // Populate teacher details
      .lean();

    if (!classDetails) {
      console.log('Class not found:', classId);
      return res.status(404).json({ error: 'Class not found' });
    }

    console.log('Class details fetched for class:', classId);

    res.json({
      classDetails: {
        semester: classDetails.semester,
        batch: classDetails.batch,
        course: classDetails.course,
        subject: classDetails.subject,
        createdBy: classDetails.createdBy,
        students: classDetails.studentList,
      },
      attendance: attendances.map((record) => ({
        date: record.dateOfFirstEntry,
        present: record.present,
        absent: record.absent,
        leave: record.leave,
      })),
    });
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    res.status(500).json({ error: 'Error fetching attendance data' });
  }
});

app.get('/attendance/classrecord/:classId/month/:month', async (req, res) => {
  const { classId, month } = req.params;

  try {
    console.log('Fetching attendance for class:', classId, 'for month:', month);

    let startDate, endDate;

    if (month === 'All') {
      console.log('Fetching full range of attendance data for class:', classId);

      const firstRecord = await Attendance.findOne({ classId: classId })
        .sort({ dateOfFirstEntry: 1 })
        .select('dateOfFirstEntry')
        .lean();

      const lastRecord = await Attendance.findOne({ classId: classId })
        .sort({ dateOfFirstEntry: -1 })
        .select('dateOfFirstEntry')
        .lean();

      if (!firstRecord || !lastRecord) {
        console.log('No attendance records found for class:', classId);
        return res.status(404).json({ error: 'No attendance records found for this class.' });
      }

      startDate = new Date(firstRecord.dateOfFirstEntry);
      endDate = new Date(lastRecord.dateOfFirstEntry);
    } else {
      console.log('Parsing month parameter:', month);

      const currentYear = new Date().getFullYear();
      const monthIndex = MONTHS[month];

      if (monthIndex === undefined) {
        console.log('Invalid month name:', month);
        return res.status(400).json({ error: 'Invalid month name. Provide a valid month.' });
      }

      startDate = new Date(currentYear, monthIndex, 1);
      endDate = new Date(currentYear, monthIndex + 1, 0, 23, 59, 59);
    }

    console.log('Fetching attendance records from', startDate, 'to', endDate);

    const attendances = await Attendance.find({
      classId: classId,
      dateOfFirstEntry: { $gte: startDate, $lte: endDate },
    })
      .populate('present absent', 'name id')
      .lean();

    console.log('Attendance records fetched:', attendances.length);

    const classDetails = await Class.findById(classId)
      .populate('studentList', 'name id')
      .lean();

    if (!classDetails) {
      console.log('Class not found:', classId);
      return res.status(404).json({ error: 'Class not found' });
    }

    console.log('Class details fetched for class:', classId);

    const studentAttendance = {};

    // Initialize attendance summary for each student
    classDetails.studentList.forEach((student) => {
      studentAttendance[student.id] = {
        name: student.name,
        id: student.id,
        totalPresent: 0,
        totalAbsent: 0,
        totalClasses: 0,
        percentage: 0,
      };
    });

    // Process attendance records
    attendances.forEach((record) => {
      record.present.forEach((student) => {
        if (studentAttendance[student.id]) {
          studentAttendance[student.id].totalPresent += 1;
        }
      });

      record.absent.forEach((student) => {
        if (studentAttendance[student.id]) {
          studentAttendance[student.id].totalAbsent += 1;
        }
      });

      // Increment total classes for all students
      Object.values(studentAttendance).forEach((student) => {
        student.totalClasses += 1;
      });
    });

    // Calculate attendance percentage for each student
    Object.values(studentAttendance).forEach((student) => {
      student.percentage = 
        student.totalClasses > 0 
          ? ((student.totalPresent / student.totalClasses) * 100).toFixed(2) 
          : 0;
    });

    res.json({
      classDetails: {
        semester: classDetails.semester,
        batch: classDetails.batch,
        course: classDetails.course,
        subject: classDetails.subject,
        createdBy: classDetails.createdBy,
      },
      attendanceSummary: Object.values(studentAttendance),
    });
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    res.status(500).json({ error: 'Error fetching attendance data' });
  }
});


// 2. Get attendance for a particular student
app.get('/attendance/student/:studentId', async (req, res) => {
  const { studentId } = req.params;

  try {
    const attendances = await Attendance.find({
      $or: [
        { present: mongoose.Types.ObjectId(studentId) },
        { absent: mongoose.Types.ObjectId(studentId) },
        { leave: mongoose.Types.ObjectId(studentId) }
      ]
    });
    res.json(attendances);
  } catch (err) {
    res.status(500).send('Error fetching data');
  }
});

// 3. Get attendance between a date range
app.get('/attendance/range', async (req, res) => {
  const { startDate, endDate } = req.query;
  
  try {
    const attendances = await Attendance.find({
      dateOfFirstEntry: { $gte: new Date(startDate), $lt: new Date(endDate) }
    });
    res.json(attendances);
  } catch (err) {
    res.status(500).send('Error fetching data');
  }
});

// 4. Get class attendance with percentage
app.get('/attendance/class/percentage/:classId/month/:month', async (req, res) => {
  const { classId, month } = req.params;
  const startDate = new Date(month);
  const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

  try {
    const attendances = await Attendance.find({
      classId: mongoose.Types.ObjectId(classId),
      dateOfFirstEntry: { $gte: startDate, $lt: endDate }
    });

    const totalClasses = attendances.length;
    const studentsAttendance = {};

    attendances.forEach(attendance => {
      attendance.present.forEach(studentId => {
        if (!studentsAttendance[studentId]) {
          studentsAttendance[studentId] = { present: 0, total: 0 };
        }
        studentsAttendance[studentId].present += 1;
        studentsAttendance[studentId].total += 1;
      });

      attendance.absent.forEach(studentId => {
        if (!studentsAttendance[studentId]) {
          studentsAttendance[studentId] = { present: 0, total: 0 };
        }
        studentsAttendance[studentId].total += 1;
      });

      attendance.leave.forEach(studentId => {
        if (!studentsAttendance[studentId]) {
          studentsAttendance[studentId] = { present: 0, total: 0 };
        }
        studentsAttendance[studentId].total += 1;
      });
    });

    const percentageData = Object.keys(studentsAttendance).map(studentId => {
      const { present, total } = studentsAttendance[studentId];
      return { studentId, percentage: (present / total) * 100 };
    });

    res.json(percentageData);
  } catch (err) {
    res.status(500).send('Error fetching data');
  }
});

app.delete('/api/class/:classId/delete', async (req, res) => {
  const { classId } = req.params;

  try {
    // Check if the class exists
    const existingClass = await Class.findById(classId);

    if (!existingClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Delete the class
    await Class.findByIdAndDelete(classId);

    res.status(200).json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({ message: 'Failed to delete the class', error });
  }
});

// Start server
app.listen(5000, () => console.log('Server started on http://localhost:5000'));