import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Paper } from '@mui/material';

const TeacherRequestModal = ({ classId, onClose }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/teacher/attendance/requests/${classId}`
        );
        setRequests(response.data.requests);
      } catch (error) {
        console.error('Error fetching requests', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [classId]);

  const handleAction = async (studentId, date, requestType, action) => {
    try {
      await axios.put('http://localhost:5000/teacher/attendance/request/action', {
        studentId,
        date,
        classId,
        requestType,
        action,
      });
      setRequests(requests.filter((request) => request.studentId !== studentId));
    } catch (error) {
      console.error('Error handling action', error);
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
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Attendance Requests</h2>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <CircularProgress />
          </Box>
        ) : requests.length === 0 ? (
          <p style={{ textAlign: 'center' }}>No attendance requests found</p>
        ) : (
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Student Name</strong></TableCell>
                  <TableCell><strong>Request Type</strong></TableCell>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell sx={{ textAlign: 'center' }}><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Total Requests: {requests.length} */}
                {requests.map((request) => (
                  <TableRow key={request.studentId}>
                    <TableCell>{request.studentName}</TableCell>
                    <TableCell>{request.requestType}</TableCell>
                    <TableCell>{new Date(request.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                        <Button
                          variant="contained"
                          sx={acceptButtonStyle}
                          onClick={() =>
                            handleAction(request.studentId, request.date, request.requestType, 'accepted')
                          }
                        >
                          Accept
                        </Button>
                        <Button
                          variant="contained"
                          sx={rejectButtonStyle}
                          onClick={() =>
                            handleAction(request.studentId, request.date, request.requestType, 'rejected')
                          }
                        >
                          Reject
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Button
          variant="outlined"
          onClick={onClose}
          sx={{ marginTop: 2, width: '100%' }}
        >
          Close
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
  width: '90%',
  maxWidth: 600,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 8,
};

const acceptButtonStyle = {
  backgroundColor: '#57b846',
  color: '#ffffff',
  '&:hover': {
    backgroundColor: '#459b3c',
  },
};

const rejectButtonStyle = {
  backgroundColor: '#ff5252',
  color: '#ffffff',
  '&:hover': {
    backgroundColor: '#e04343',
  },
};

export default TeacherRequestModal;
