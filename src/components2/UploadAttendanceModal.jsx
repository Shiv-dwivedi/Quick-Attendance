import React, { useState } from 'react';
import { Modal, Box, Button, Typography, Chip } from '@mui/material';

const UploadModal = ({ open, onClose, classId }) => {
  const [file, setFile] = useState(null);
  const [recognizedStudents, setRecognizedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState('');

  const handleFileChange = (event) => {
    setFile(event.target.files[0]); // Set selected file
  };

  const handleUpload = async () => {
    if (!file) return; // Ensure a file is selected
    setLoading(true);
    setAttendanceStatus(''); // Reset status message

    const formData = new FormData();
    formData.append('file', file); // Add the file to FormData

    try {
      const response = await fetch(`http://localhost:8000/api/upload/${classId}`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setRecognizedStudents(data.recognized); // Set recognized students
        setAttendanceStatus('Students recognized successfully.');
      } else {
        console.error('Upload failed');
        setAttendanceStatus('Upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setAttendanceStatus('Error uploading file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async () => {
    if (recognizedStudents.length === 0) {
      setAttendanceStatus('No students to mark attendance for.');
      return;
    }

    const studentIds = recognizedStudents.map(student => student.id);

    try {
      const response = await fetch(`http://localhost:5000/api/classes/${classId}/mark-attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recognizedStudentIds: studentIds }),
      });

      if (response.ok) {
        setAttendanceStatus('Attendance saved successfully.');
      } else {
        setAttendanceStatus('Failed to save attendance. Please try again.');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      setAttendanceStatus('Error saving attendance.');
    }
    
    onClose(); // Close modal after marking attendance
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={styles.modalContainer}>
        <Typography variant="h6" sx={styles.modalTitle}>Upload Photo/Video</Typography>
        <input type="file" accept="image/*,video/*" onChange={handleFileChange} />
        <Button variant="contained" color="primary" onClick={handleUpload} sx={styles.uploadButton} disabled={loading}>
          {loading ? 'Uploading...' : 'Upload'}
        </Button>

        {recognizedStudents.length > 0 && (
          <Box sx={styles.recognizedContainer}>
            <Typography variant="h6">Recognized Students:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
              {recognizedStudents.map((student) => (
                <Chip
                  key={student.id}
                  label={`${student.name}`}
                  sx={styles.studentChip}
                />
              ))}
            </Box>
            <Button variant="contained" color="secondary" onClick={markAttendance} sx={styles.markButton}>
              Mark Attendance
            </Button>
          </Box>
        )}

        {attendanceStatus && (
          <Typography variant="body2" sx={{ mt: 2, color: 'green' }}>
            {attendanceStatus}
          </Typography>
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
    backgroundColor: 'white',
    padding: '20px',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    outline: 'none',
    width: 400,
  },
  modalTitle: {
    marginBottom: '20px',
  },
  uploadButton: {
    marginTop: '10px',
  },
  recognizedContainer: {
    marginTop: '20px',
  },
  studentChip: {
    backgroundColor: '#f1f1f1',
    borderRadius: '16px',
    padding: '0 8px',
  },
  markButton: {
    marginTop: '20px',
  },
};

export default UploadModal;
