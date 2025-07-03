import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Box, Button, TextField, Autocomplete } from '@mui/material';
import { subjectOptions, semesterOptions, courseOptions, collegeOptions, JIBBOptions, VIAETOptions } from './dataOptions';

const CreateClassModal = ({ onClose, onCreate, teacherId }) => {
  console.log('Teacher ID:', teacherId);
  const [semester, setSemester] = useState('');
  const [batch, setBatch] = useState('');
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectLevel, setSubjectLevel] = useState('');
  const [subject, setSubject] = useState('');
  const [studentList, setStudentList] = useState([]);

  const currentYear = new Date().getFullYear();
  const batchOptions = Array.from({ length: 11 }, (_, i) => (currentYear - 5 + i).toString());
  
  // Update courses based on selected college
  const courseOptions = college === 'Jacob Institute of Biotechnology and Bio-Engineering (JIBB)' ? JIBBOptions : VIAETOptions;

  // Update subject name based on code and level
  useEffect(() => {
    if (subjectCode && subjectLevel) {
      const fullCode = `${subjectCode} ${subjectLevel}`;
      setSubject(subjectOptions[fullCode] || '');
    }
  }, [subjectCode, subjectLevel]);

  useEffect(() => {
    async function fetchStudents() {
      if (batch && course) {
        try {
          const response = await axios.get('http://localhost:5000/api/students', {
            params: { batch, course },
          });
          setStudentList(response.data);
        } catch (error) {
          console.error('Error fetching students:', error);
        }
      }
    }
    fetchStudents();
  }, [batch, course]);

  const handleCreateClass = async () => {
    const token = localStorage.getItem('token');
    try {
      const studentIds = studentList.map((student) => student._id); // Get student IDs

      const response = await axios.post(
        'http://localhost:5000/api/classes/create',
        {
          semester,
          batch,
          college,
          course,
          subjectCode,
          subjectLevel,
          subject,
          studentList: studentIds,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Creating class with:', teacherId);

      // Call the onCreate callback to refresh the dashboard or update the UI
      onCreate(response.data.class); // Handle the created class data

      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error creating class:', error);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      sx={{
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
      }}
    >
      <Box sx={modalStyle}>
        <h2>Create New Class</h2>

        {/* Semester Selection */}
        <Autocomplete
          options={semesterOptions}
          renderInput={(params) => <TextField {...params} label="Semester" sx={textFieldStyle} />}
          value={semester}
          onChange={(event, newValue) => setSemester(newValue)}
          fullWidth
        />

        {/* Batch Selection */}
        <Autocomplete
          options={batchOptions}
          renderInput={(params) => <TextField {...params} label="Batch" sx={textFieldStyle} />}
          value={batch}
          onChange={(event, newValue) => setBatch(newValue)}
          fullWidth
        />

        {/* College Selection */}
        <Autocomplete
          options={collegeOptions}
          renderInput={(params) => <TextField {...params} label="College" sx={textFieldStyle} />}
          value={college}
          onChange={(event, newValue) => {
            setCollege(newValue);
            setCourse(''); // Reset course when college changes
          }}
          fullWidth
        />

        {/* Course Selection */}
        <Autocomplete
          options={courseOptions}
          renderInput={(params) => <TextField {...params} label="Course" sx={textFieldStyle} />}
          value={course}
          onChange={(event, newValue) => setCourse(newValue)}
          fullWidth
        />

        {/* Subject Code */}
        <TextField
          label="Subject Code"
          value={subjectCode}
          onChange={(e) => setSubjectCode(e.target.value.toUpperCase())} // Convert to uppercase
          sx={textFieldStyle}
          fullWidth
        />

        {/* Subject Level */}
        <TextField
          label="Level"
          value={subjectLevel}
          onChange={(e) => setSubjectLevel(e.target.value)}
          sx={textFieldStyle}
          fullWidth
        />

        {/* Subject Name */}
        <TextField
          label="Subject Name"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          sx={textFieldStyle}
          fullWidth
        />

        <Button variant="contained" onClick={handleCreateClass} sx={buttonStyle}>
          Create Class
        </Button>
      </Box>
    </Modal>
  );
};

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 8,
  zIndex: 1001,
};

const textFieldStyle = {
  mb: 2,
  '& .MuiInputBase-root': {
    transition: 'all 0.3s ease-in-out',
  },
  '& .MuiInputBase-root:hover': {
    borderColor: '#57b846',
  },
};

const buttonStyle = {
  borderRadius: 8,
  width: '100%',
  backgroundColor: '#57b846',
  color: '#ffffff',
  '&:hover': {
    backgroundColor: '#459b3c',
  },
};

export default CreateClassModal;
