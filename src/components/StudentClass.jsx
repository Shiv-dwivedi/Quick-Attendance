import React, { useState, useEffect } from 'react';
import { Box, Grid, Card, Typography, Button, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import {useLocation, useParams,useNavigate } from 'react-router-dom';
import CalendarComponent from './StudentCalender';
import AttendanceChart from './StudentChart'; // Import the chart component
import axios from 'axios';
import AttendanceRequestModal from './AttendanceRequestModal';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 

const ClassDetailPage = () => {
    const { state } = useLocation();
  const [attendanceStats, setAttendanceStats] = useState({
    totalClasses: 0,
    totalPresent: 0,
    totalAbsent: 0,
    onLeave: 0,
  });
  const [className, setClassName] = useState('');
  const { classId } = useParams();
  const studentId = state?.studentId;// Replace with actual student ID (from user context, for example).
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (classId) {
      fetchClassDetails();
      fetchAttendanceStats();
    }
  }, [classId]);

  const fetchClassDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/class/${classId}/details`);
      if (response.data) {
        setClassName(response.data.subject);
      } else {
        console.warn('Class details not found');
      }
    } catch (error) {
      console.error('Error fetching class details:', error);
    }
  };

  const fetchAttendanceStats = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/attendance/stats/${classId}/${studentId}`);
      if (response.data) {
        const { totalClasses, present, absent, leave } = response.data;
        setAttendanceStats({
          totalClasses,
          totalPresent: present,
          totalAbsent: absent,
          onLeave: leave,
        });
      } else {
        console.warn('Attendance stats not found');
      }
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
    }
  };

  const handleRequestClick = () => {
    setIsModalOpen(true); // Open the modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Close the modal
  };


  const handleDateChange = (date) => {
    // Use selected date for filtering or other logic if needed
    console.log('Selected Date:', date.toISOString());
  };

  return (
    <Box p={3} sx={styles.pageContainer}>
      {/* Header Section */}
      <Box sx={styles.header}>
      <IconButton sx={styles.arrowButton} onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={styles.className}>
          {className}
        </Typography>
        <Box sx={styles.headerButtons}>
        <Button variant="contained" sx={styles.headerButton} onClick={handleRequestClick}>
            Request
          </Button>
          {/* <Button variant="contained" sx={styles.headerButton}>
            Notice/Announcement
          </Button> */}

        </Box>
      </Box>

      {/* Attendance Stats Cards */}
      <Grid container spacing={3}>
        {[
          { label: 'Total Classes', value: attendanceStats.totalClasses },
          { label: 'Total Present', value: attendanceStats.totalPresent },
          { label: 'Total Absent', value: attendanceStats.totalAbsent },
          { label: 'On Leave', value: attendanceStats.onLeave },
        ].map(({ label, value }) => (
          <Grid item xs={12} sm={6} md={3} key={label}>
            <Card sx={styles.card}>
              <Typography variant="h6">{label}</Typography>
              <Typography variant="h4" color="primary">
                {value}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Attendance Chart and Calendar */}
      <Grid container spacing={3} mt={3}>
        <Grid item xs={12} md={6}>
          <Card sx={styles.card}>
            <Typography variant="h6">Attendance Flow</Typography>
            <AttendanceChart classId={classId} studentId={studentId}/>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={styles.card}>
            <Typography variant="h6">Calendar</Typography>
            <CalendarComponent onDateChange={handleDateChange} classId={classId} studentId={studentId}/>
          </Card>
        </Grid>
      </Grid>
      {isModalOpen && (
        <AttendanceRequestModal
          classId={classId}
          studentId={studentId}
          onClose={handleCloseModal}
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
  arrowButton: {
    backgroundColor: '#f1f1f1',
    color: '#333',
    '&:hover': {
      backgroundColor: '#ddd',
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
};

export default ClassDetailPage;
