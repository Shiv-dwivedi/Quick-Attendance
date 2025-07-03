import React, { useState, useEffect, useRef } from 'react';
import { Box, Grid, Card, Typography, Button, IconButton, Fab, Divider,Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'; // Import Divider
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloudUpload from '@mui/icons-material/CloudUpload';
import LiveTv from '@mui/icons-material/LiveTv';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AlbumIcon from '@mui/icons-material/Album';
import DeleteIcon from '@mui/icons-material/Delete';
import LiveAttendanceModal from './LiveAttendanceModal';
import UploadModal from './UploadAttendanceModal';
import { useParams, useNavigate } from 'react-router-dom';
import CalendarComponent from './CalendarComponent';
import AttendanceChart from './AttendanceChart'; // Import the chart component
import axios from 'axios';
import TeacherRequestModal from './TeacherRequestModal';
import PrintAttendance from './PrintAttendance'
import TeacherDashboard from './TeacherDashboard'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 

import Badge from '@mui/material/Badge';

const ClassDetailPage = () => {
  const [expanded, setExpanded] = useState(false);
  const [liveAttendanceOpen, setLiveAttendanceOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [attendanceData, setAttendanceData] = useState({
    totalPresent: 0,
    totalAbsent: 0,
    onLeave: 0,
    requests: 0,
    students: []
  });
  const [totalStudents, setTotalStudents] = useState(0);
  const [className, setClassName] = useState(''); // State to store class name (subject)
  const [allStudents, setAllStudents] = useState([]); // State to store all students
  const [dayKey, setDayKey] = useState(new Date());
  const fabRef = useRef(null);
  const { classId } = useParams();
  const [studentStatus, setStudentStatus] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();
 
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
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

  useEffect(() => {
    if (classId) {
      fetchClassDetails();
      fetchAttendanceData(dayKey);
    }
  }, [dayKey, classId]);

  // Function to fetch class details, including the subject and student list
  const fetchClassDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/class/${classId}/details`);
      if (response.data) {
        setClassName(response.data.subject); // Set the class name (subject)
        setAllStudents(response.data.students); // Set the list of all students
        setTotalStudents(response.data.students.length); // Set total students based on response
      } else {
        console.warn('Class details not found');
      }
    } catch (error) {
      console.error('Error fetching class details:', error);
    }
  };

  const fetchAttendanceData = async (date) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/attendances/${classId}/${date.toISOString()}`);
      if (response.data) {
        const {
          present = [],
          absent = [],
          leave = [],
          requests = [],
        } = response.data;

        // Create a mapping of student IDs to their attendance statuses
        const studentAttendanceMap = {};

        present.forEach(student => {
          studentAttendanceMap[student._id] = 'present';
        });

        absent.forEach(student => {
          studentAttendanceMap[student._id] = 'absent';
        });

        leave.forEach(student => {
          studentAttendanceMap[student._id] = 'leave';
        });

        // Map over allStudents to add the status
        const updatedStudents = allStudents.map(student => {
          return {
            ...student,
            status: studentAttendanceMap[student._id] || 'unknown', // 'unknown' for students with no recorded status
          };
        });

        setAttendanceData({
          totalPresent: present.length,
          totalAbsent: absent.length,
          onLeave: leave.length,
          requests: requests.length,
          students: updatedStudents, // Now we set the students with their respective statuses
        });

        console.log('Updated Attendance Data:', date, updatedStudents); // Debugging statement
      } else {
        setAttendanceData({
          totalPresent: 0,
          totalAbsent: 0,
          onLeave: 0,
          requests: 0,
          students: allStudents.map(student => ({ ...student, status: 'unknown' })), // Set all students to unknown if no data
        });
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setAttendanceData({
        totalPresent: 0,
        totalAbsent: 0,
        onLeave: 0,
        requests: 0,
        students: allStudents.map(student => ({ ...student, status: 'unknown' })), // Handle error gracefully
      });
    }
  };

  const handleDeleteClass = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/class/${classId}/delete`);
      alert('Class deleted successfully');
      setDeleteDialogOpen(false);
      navigate('/teacher-dashboard')
    } catch (error) {
      console.error('Error deleting class:', error);
      alert('Failed to delete the class');
    }
  };

  const handlePrintReportClick = () => {
    setPrintModalOpen(true); 
    console.log('Print modal state:', printModalOpen);// Open the modal
    console.log('clicked')
  };
  
  const handlePrintModalClose = () => {
    setPrintModalOpen(false); // Close the modal
  };
  

  const handleRequestClick = () => {
    setIsModalOpen(true); // Open the modal
    setIsModalOpen(true);
    console.log("Is Modal Open:", isModalOpen);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false); // Close the modal
  };

  const handleToggleExpand = (event) => {
    event.stopPropagation();
    setExpanded(!expanded);
  };

  const handleLiveAttendanceOpen = (event) => {
    event.stopPropagation();
    setLiveAttendanceOpen(true);
  };

  const handleUploadOpen = (event) => {
    event.stopPropagation();
    setUploadModalOpen(true);
  };

  const handleLiveAttendanceClose = () => {
    setLiveAttendanceOpen(false);
  };

  const handleUploadClose = () => {
    setUploadModalOpen(false);
  };

  const handleOutsideClick = (event) => {
    if (fabRef.current && !fabRef.current.contains(event.target)) {
      setExpanded(false);
    }
  };

  const handleDateChange = (date) => {
    const selectedDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    setDayKey(selectedDate);
  };

  const handleAttendanceChange = async (studentId, status) => {
    try {
      // Immediately update the student's status in the local state
      setAttendanceData((prevData) => {
        const updatedStudents = prevData.students.map((student) =>
          student._id === studentId ? { ...student, status } : student
        );

        return {
          ...prevData,
          students: updatedStudents,
          totalPresent: updatedStudents.filter(s => s.status === 'present').length,
          totalAbsent: updatedStudents.filter(s => s.status === 'absent').length,
          onLeave: updatedStudents.filter(s => s.status === 'leave').length,
        };
      });

      // Make the API call to update attendance in the backend
      await axios.post('http://localhost:5000/api/attendance/update', {
        studentId: studentId,
        status: status,
        classId: classId,
        date: dayKey.toISOString(),
      });
    } catch (error) {
      console.error('Error updating attendance:', error);
      // Optionally handle error case, maybe set a notification state or revert the UI change
    }
  };

  useEffect(() => {
    if (expanded) {
      document.addEventListener('click', handleOutsideClick);
    } else {
      document.removeEventListener('click', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [expanded]);

  return (
    <Box p={3} sx={styles.pageContainer}>
      {/* Header Section */}
      <Box sx={styles.header}>
      <IconButton sx={styles.arrowButton} onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={styles.className}>
          {className} {/* Display the class name */}
        </Typography>
        <Box sx={styles.headerButtons}>

        <Box sx={{ position: 'relative' }}>
        <Button 
          variant="contained" 
          sx={styles.headerButton} 
          onClick={handleRequestClick}
          disabled={loading}
        >
          Request
        </Button>
        
        <Badge 
          badgeContent={loading ? '...' : requests.length} 
          color="error" 
          sx={{
            position: 'absolute',
            width: 30,  
            height: 30, 
            borderRadius: '50%',
            fontSize: '16px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            top: 7,
            right: 7,
          }}
        />
      </Box>


          <Button
            variant="contained"
            sx={styles.headerButton}
            onClick={handlePrintReportClick} // Trigger modal on click
          >
            Print Report
          </Button>

          <IconButton sx={styles.deleteIcon} onClick={() => setDeleteDialogOpen(true)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>

      <Divider sx={{ my: 2, height: '4px' }} />

      {/* Top 4 Cards */}
      <Grid container spacing={3}>
        {[
          { label: 'Total Students', value: totalStudents },
          { label: 'Total Present', value: attendanceData.totalPresent },
          { label: 'Total Absent', value: attendanceData.totalAbsent },
          { label: 'On Leave', value: attendanceData.onLeave },
          { label: 'Requests', value: attendanceData.requests },
        ].map(({ label, value }) => (
          <Grid item xs={12} sm={6} md={2.4} key={label}>
            <Card sx={styles.card}>
              <Typography variant="h6">{label}</Typography>
              <Typography variant="h4" color="primary">
                {value}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Line Graph and Calendar Section */}
      <Grid container spacing={3} mt={3}>
        <Grid item xs={12} md={6}>
          <Card sx={styles.card}>
            <Typography variant="h6">Attendance Flow</Typography>
            <AttendanceChart classId={classId} />
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={styles.card}>
            <Typography variant="h6">Calendar</Typography>
            <CalendarComponent onDateChange={handleDateChange} />
          </Card>
        </Grid>
      </Grid>

      {/* Student List Grid */}
      <Grid container spacing={3} mt={3}>
        <Grid item xs={12}>
          <Card sx={styles.studentGrid}>
            <Typography variant="h6"><b>Students</b></Typography>
            <Grid container spacing={2} mt={2}>
  {attendanceData.students && attendanceData.students.length > 0 ? (
    attendanceData.students.map(student => (
      <Grid item xs={12} sm={6} md={4} lg={3} key={student._id}>
        <Card
          sx={{
            ...styles.studentCard,
            borderColor: student.status === 'present' ? '#66bb6a' :
              student.status === 'absent' ? '#f44336' :
                student.status === 'leave' ? '#ff9800' : '#ccc',
          }}
        >
          <Typography variant="body1" sx={styles.studentName}>
            {student.name}
          </Typography>
          <Typography variant="body1">
  <span style={{ fontWeight: 'bold' }}>ID:</span> {student.id}
</Typography>
          <Typography variant="body1">
          <span style={{ fontWeight: 'bold' }}> Course:</span> {student.course}
          </Typography>
          <Box sx={styles.attendanceButtons}>
            <IconButton
              sx={{
                color: student.status === 'present' ? '#4caf50' : 'default', // Green for present
              }}
              onClick={() => handleAttendanceChange(student._id, 'present')}
            >
              <CheckCircleIcon />
            </IconButton>
            <IconButton
              color={student.status === 'absent' ? 'error' : 'default'}
              onClick={() => handleAttendanceChange(student._id, 'absent')}
            >
              <CancelIcon />
            </IconButton>
            <IconButton
              color={student.status === 'leave' ? 'warning' : 'default'}
              onClick={() => handleAttendanceChange(student._id, 'leave')}
            >
              <AlbumIcon />
            </IconButton>
          </Box>
        </Card>
      </Grid>
    ))
  ) : (
    <Typography variant="body1" color="textSecondary">No students available.</Typography>
  )}
</Grid>

          </Card>
        </Grid>
      </Grid>

      {/* Floating Attendance Button with Toggle State */}
      <Box sx={styles.fabGroup} ref={fabRef}>
        {!expanded ? (
          <Fab
            color="primary"
            sx={styles.fab}
            aria-label="mark-attendance"
            onClick={handleToggleExpand}
          >
            <CheckIcon />
          </Fab>
        ) : (
          <Box>
            <Fab
              color="secondary"
              sx={styles.fabOption}
              aria-label="live"
              onClick={handleLiveAttendanceOpen}
            >
              <LiveTv />
            </Fab>
            <Fab
              color="secondary"
              sx={styles.fabOption}
              aria-label="upload"
              onClick={handleUploadOpen}
            >
              <CloudUpload />
            </Fab>
          </Box>
        )}
      </Box>
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this class? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">Cancel</Button>
          <Button onClick={handleDeleteClass} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
      {/* Modals */}
      <LiveAttendanceModal open={liveAttendanceOpen} onClose={handleLiveAttendanceClose} classId={classId} />
      <UploadModal open={uploadModalOpen} onClose={handleUploadClose} classId={classId} />
      {isModalOpen && (
        <TeacherRequestModal
          classId={classId}
          onClose={handleCloseModal}
        />
      )}

            {/* PrintAttendance Modal */}
            {printModalOpen && (
              <PrintAttendance
    open={printModalOpen}
    onClose={handlePrintModalClose}
    classId={classId}
  />
)}
    </Box>
  );
};

const styles = {
  pageContainer: {
    backgroundColor: '#f9f9f9',
    position: 'relative',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 3,
    padding: '10px 0',
  },
  
  className: {
    fontWeight: 'bold',
    flexGrow: 1,  // This ensures the element takes up available space
    display: 'flex',
    justifyContent: 'center',  // Center horizontally
    alignItems: 'center',      // Center vertically
    textAlign: 'center',  
  },
    arrowButton: {
    backgroundColor: '#f1f1f1',
    color: '#333',
    '&:hover': {
      backgroundColor: '#ddd',
    },
  },
  headerButtons: {
    display: 'flex',
    alignItems: 'center',
  },
  headerButton: {
    backgroundColor: '#66bb6a',
    color: '#fff',
    borderRadius: '20px',
    padding: '5px 20px',
    textTransform: 'none',
    marginLeft: '10px',
    '&:hover': {
      backgroundColor: '#57a05a',
    },
  },
  editIcon: {
    marginLeft: '10px',
    backgroundColor: '#fff',
    color: '#66bb6a',
    borderRadius: '50%',
    '&:hover': {
      backgroundColor: '#66bb6a',
      color: '#fff',
    },
  },
  card: {
    padding: '20px',
    textAlign: 'center',
    borderRadius: '20px',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'scale(1.02)',
    },
  },
  studentGrid: {
    padding: '20px',
    borderRadius: '20px',
    backgroundColor: '#fff',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
  },
  studentCard: {
    padding: '15px',
    textAlign: 'Left',
    borderRadius: '20px',
    boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
    border: '1px solid #66bb6a',
    height: '100px'
  },
  attendanceButtons: {
    display: 'flex',
    justifyContent: 'space-around', // Ensures even spacing between buttons
    alignItems: 'center', // Vertically centers the buttons
    marginTop: 'auto', // Pushes the buttons to the bottom of the card
  },
  studentCard: {
    padding: '15px',
    textAlign: 'left',
    borderRadius: '20px',
    boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
    border: '1px solid #ccc',
    height: 'auto', // Allow height to adjust based on content
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  studentName: {
    fontWeight: 'bold',
    wordWrap: 'break-word', // Ensure long names break to the next line
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  attendanceButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '10px', // Add margin to separate text and buttons
  },

  chipContainer: {
    marginTop: '20px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  fab: {
    position: 'fixed',
    bottom: 16,
    right: 16,
    backgroundColor: '#66bb6a',
    '&:hover': {
      backgroundColor: '#57a05a',
    },
  },
  fabGroup: {
    position: 'fixed',
    bottom: 16,
    right: 16,
  },
  fabOption: {
    backgroundColor: '#66bb6a',
    '&:hover': {
      backgroundColor: '#57a05a',
    },
    marginBottom: '10px',
  },
};

export default ClassDetailPage;
