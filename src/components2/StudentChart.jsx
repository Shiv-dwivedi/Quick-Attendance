import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import { Box, Typography, CircularProgress, TextField } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { Chart, Filler } from 'chart.js';

Chart.register(Filler);
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const AttendanceChart = ({ classId, studentId }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [streak, setStreak] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    const startOfMonth = dayjs().startOf('month');
    const endOfMonth = dayjs().endOf('month');
    setStartDate(startOfMonth);
    setEndDate(endOfMonth);
  }, []);

  useEffect(() => {
    if (classId && studentId && startDate && endDate) {
      fetchAttendanceData();
    }
  }, [classId, studentId, startDate, endDate]);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const formattedStartDate = startDate.toISOString();
      const formattedEndDate = endDate.toISOString();

      const response = await axios.get(`http://localhost:5000/api/attendance/streak/${classId}/${studentId}`, {
        params: {
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        },
      });

      const { attendanceHistory } = response.data;

      let currentStreak = 0;
      const formattedData = attendanceHistory.map((item) => {
        if (item.status === 'present') {
          currentStreak += 1;
        } else {
          currentStreak = 0; // Reset streak on absent/leave
        }

        return {
          date: dayjs(item.date).format('YYYY-MM-DD'),
          streak: currentStreak,
        };
      });

      setAttendanceData(formattedData);
      setStreak(currentStreak);
    } catch (err) {
      console.error('Error fetching attendance data:', err);
      setError('Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: attendanceData.map((item) => item.date),
    datasets: [
      {
        label: 'Attendance Streak',
        data: attendanceData.map((item) => item.streak),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(75, 192, 192, 1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Streak Count',
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ padding: 2 }}>
        <Box display="flex" justifyContent="space-between" marginBottom={2}>
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            renderInput={(params) => (
              <TextField {...params} InputProps={{ style: { borderRadius: '8px' } }} />
            )}
          />
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            renderInput={(params) => (
              <TextField {...params} InputProps={{ style: { borderRadius: '8px' } }} />
            )}
          />
        </Box>
        <Box
          sx={{
            height: '285px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: 2,
          }}
        >
          {loading ? (
            <CircularProgress />
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : attendanceData.length > 0 ? (
            <Box sx={{ height: '100%', width: '100%' }}>
              <Line data={chartData} options={options} />
            </Box>
          ) : (
            <Typography>No attendance data available for the selected date range.</Typography>
          )}
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default AttendanceChart;
