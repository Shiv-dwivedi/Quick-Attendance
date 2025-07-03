import React, { useState, useEffect, useRef } from 'react';
import { Modal, Box, Typography, Button, Chip } from '@mui/material';
import axios from 'axios';

const LiveAttendanceModal = ({ open, onClose, classId }) => {
  const [attendanceStarted, setAttendanceStarted] = useState(false);
  const [students, setStudents] = useState([]); // List of recognized students
  const [attendanceStatus, setAttendanceStatus] = useState('');
  const ws = useRef(null); // WebSocket reference to manage connection

  // Open WebSocket connection when attendance is started
  const handleStartAttendance = () => {
    setAttendanceStarted(true);
    setAttendanceStatus('Attendance in progress...');

    // Create a WebSocket connection to the backend
    ws.current = new WebSocket(`ws://localhost:8000/ws/recognize`);

    ws.current.onopen = () => {
      console.log("WebSocket connection established.");
      setAttendanceStatus('WebSocket connection established.');
      
      // Send classId to the backend
      if (classId) {
        ws.current.send(JSON.stringify({ classId }));
      }
    };

    ws.current.onmessage = (event) => {
      const message = event.data;
      console.log("Raw WebSocket message:", message);

      try {
        if (message.startsWith("Recognized Students:")) {
          const jsonData = message.replace("Recognized Students: ", "");
          const recognizedStudents = JSON.parse(jsonData);

          if (Array.isArray(recognizedStudents) && recognizedStudents.length > 0) {
            setStudents((prev) => {
              const newStudents = recognizedStudents.filter(
                student => !prev.some(prevStudent => prevStudent.id === student.id)
              );
              
              return [...prev, ...newStudents];
            });

            const recognizedNames = recognizedStudents.map(student => student.name);
            setAttendanceStatus(`Recognized: ${recognizedNames.join(', ')}`);
          } else {
            console.log("No recognized students in the message.");
          }
        } else {
          console.error("Unexpected message format:", message);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
        setAttendanceStatus('Error processing recognized students.');
      }
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setAttendanceStatus('WebSocket connection error.');
    };

    ws.current.onclose = () => {
      console.log("WebSocket connection closed.");
      setAttendanceStatus('Attendance session ended.');
    };
  };

  // Handle stopping attendance and closing the WebSocket connection
  const handleDone = async () => {
    console.log('Attendance done.');
    setAttendanceStarted(false);
  
    // Close WebSocket connection
    if (ws.current) {
      ws.current.close();
      console.log('WebSocket connection closed on Done.');
    }
  
    // Extract student IDs from the recognized students
    const studentIds = students.map(student => student.id);
  
    try {
      console.log(studentIds);
      const response = await axios.post(`http://localhost:5000/api/classes/${classId}/mark-attendance`, {
        recognizedStudentIds: studentIds, // Pass the recognized student IDs
      });
  
      if (response.status === 200) {
        setAttendanceStatus('Attendance saved successfully.');
      } else {
        setAttendanceStatus('Failed to save attendance.');
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      setAttendanceStatus('Error saving attendance.');
    }
  
    onClose(); // Close the modal
  };
  

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="live-attendance-modal-title"
      aria-describedby="live-attendance-modal-description"
    >
      <Box sx={styles.modalContainer}>
        <Typography id="live-attendance-modal-title" variant="h6" component="h2" align="center">
          Live Attendance
        </Typography>

        {!attendanceStarted && (
          <Typography id="live-attendance-modal-description" sx={{ mt: 2 }} align="center">
            Ready to start capturing student attendance.
          </Typography>
        )}

        {!attendanceStarted ? (
          <Button
            variant="contained"
            color="success"
            sx={styles.startButton}
            onClick={handleStartAttendance}
          >
            Start Attendance
          </Button>
        ) : (
          <>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2, justifyContent: 'center' }}>
              {students.map((student, index) => (
                <Chip
                  key={index}
                  label={student.name}
                  sx={styles.studentChip}
                />
              ))}
            </Box>

            <Typography sx={{ mt: 2, color: 'green' }} align="center">
              {attendanceStatus}
            </Typography>

            <Button
              variant="contained"
              color="primary"
              onClick={handleDone}
              sx={{ mt: 2 }}
            >
              Done
            </Button>
          </>
        )}
      </Box>
    </Modal>
  );
};

const styles = {
  modalContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    borderRadius: '8px',
  },
  startButton: {
    backgroundColor: '#66bb6a',
    '&:hover': {
      backgroundColor: '#57a05a',
    },
    borderRadius: '20px',
    width: '100%',
  },
  studentChip: {
    backgroundColor: '#f1f1f1',
    borderRadius: '16px',
    padding: '0 8px',
  },
};

export default LiveAttendanceModal;
