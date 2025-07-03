import React, { useState, useEffect } from 'react';
import { Modal, Box, Button, Select, MenuItem, TextField, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PrintAttendance = ({ open, onClose, classId }) => {
  const [step, setStep] = useState(1);
  const [option, setOption] = useState('Choose an option');
  const [month, setMonth] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [studentId, setStudentId] = useState('');
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const navigate = useNavigate();

  // Fetch student list when Option 3 is selected
  useEffect(() => {
    if (option === '3') {
      axios
        .get(`/attendance/class/${classId}/students`)
        .then((response) => setStudents(response.data.students))
        .catch((error) => console.error('Error fetching student list:', error));
    }
  }, [option, classId]);


  useEffect(() => {
    const transformAttendanceData = () => {
      if (!attendanceData || !attendanceData.attendance) return;
  
      const students = attendanceData.classDetails.students;
      const attendance = attendanceData.attendance;
  
      const transformedData = students.map((student) => {
        const attendanceRow = { name: student.name, attendance: [] };
  
        // Generate a map for quick lookups of attendance status
        const dateMap = {};
        attendance.forEach((entry) => {
          const date = new Date(entry.date).getDate(); // Extract day of the month
          if (entry.present.some((p) => p.id === student.id)) {
            dateMap[date] = 'P';
          } else if (entry.absent.some((a) => a.id === student.id)) {
            dateMap[date] = 'A';
          } else if (entry.leave.some((l) => l.id === student.id)) {
            dateMap[date] = 'L';
          } else {
            dateMap[date] = ''; // No record for this date
          }
        });
  
        // Populate the attendance for each day of the month
        for (let day = 1; day <= 31; day++) {
          attendanceRow.attendance.push(dateMap[day] || ''); // Default to empty if no record
        }
  
        return attendanceRow;
      });
  
      setAttendanceData(transformedData); // Update state with transformed data
    };
  
    transformAttendanceData();
  }, [attendanceData]); // Listen to changes in attendanceData
  
  

  // Fetch attendance data based on option selected
  const handleFetchAttendance = async () => {
    let endpoint = '';
    if (option === '1') endpoint = `http://localhost:5000/attendance/class/${classId}/month/${month}`;
    if (option === '2') endpoint = `http://localhost:5000/attendance/classrecord/${classId}/month/${month}`;
    if (option === '3') endpoint = `http://localhost:5000/attendance/class/${classId}/student/${studentId}`;
    if (option === '4')
      endpoint = `http://localhost:5000/attendance/class/${classId}/date-range?startDate=${dateRange.start}&endDate=${dateRange.end}`;

    try {
      const response = await axios.get(endpoint);
      setAttendanceData(response.data);
      console.log('Attendance Data:', attendanceData);
      setStep(4); 
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    }
  };

  // Render Table for Option 1
  // const renderTableForOption1 = () => {
  //   if (!Array.isArray(attendanceData) || attendanceData.length === 0) {
  //     return <p>No attendance data available.</p>;
  //   }
    
  //   // return (
  //   //   <Table>
  //   //     <TableHead>
  //   //       <TableRow>
  //   //         <TableCell>S.No.</TableCell>
  //   //         <TableCell>Name</TableCell>
  //   //         {Array.from({ length: 31 }, (_, i) => (
  //   //           <TableCell key={i}>{i + 1}</TableCell>
  //   //         ))}
  //   //       </TableRow>
  //   //     </TableHead>
  //   //     <TableBody>
  //   //       {attendanceData.map((row, index) => (
  //   //         <TableRow key={index}>
  //   //           <TableCell>{index + 1}</TableCell>
  //   //           <TableCell>{row.name}</TableCell>
  //   //           {row.attendance.map((status, i) => (
  //   //             <TableCell key={i}>{status}</TableCell>
  //   //           ))}
  //   //         </TableRow>
  //   //       ))}
  //   //     </TableBody>
  //   //   </Table>
  //   // );
  // };

  // const renderTableForOption2 = () => {
  //   if (!Array.isArray(attendanceData) || attendanceData.length === 0) {
  //     return <p>No attendance data available.</p>;
  //   }
  
  //   return (
  //     <Table>
  //       <TableHead>
  //         <TableRow>
  //           <TableCell>S.No.</TableCell>
  //           <TableCell>Name</TableCell>
  //           <TableCell>Total Present</TableCell>
  //           <TableCell>Total Absent</TableCell>
  //           <TableCell>Total Classes</TableCell>
  //           <TableCell>Attendance %</TableCell>
  //         </TableRow>
  //       </TableHead>
  //       <TableBody>
  //         {attendanceData.map((row, index) => (
  //           <TableRow key={index}>
  //             <TableCell>{index + 1}</TableCell>
  //             <TableCell>{row.name}</TableCell>
  //             <TableCell>{row.totalPresent}</TableCell>
  //             <TableCell>{row.totalAbsent}</TableCell>
  //             <TableCell>{row.totalClasses}</TableCell>
  //             <TableCell>{row.percentage}</TableCell>
  //           </TableRow>
  //         ))}
  //       </TableBody>
  //     </Table>
  //   );
  // };
  
  
  

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
      }}
    >
      <Box sx={modalStyle}>
        <h2>Print Attendance</h2>

        {/* Back Button */}
        {step > 1 && (
          <Button
            variant="outlined"
            onClick={() => setStep(1)}
            sx={{ mb: 2, borderRadius: 8, color: '#57b846', borderColor: '#57b846', '&:hover': { borderColor: '#459b3c', color: '#459b3c' } }}
          >
            Back to Options
          </Button>
        )}

        {/* Step 1: Option Selection */}
        {step === 1 && (
          <Select
            value={option}
            onChange={(e) => {
              setOption(e.target.value);
              setStep(2);
            }}
            fullWidth
            sx={textFieldStyle}
            displayEmpty
          >
            <MenuItem value="Choose an option" disabled>
              Choose an option
            </MenuItem>
            <MenuItem value="1">Whole Class by Months</MenuItem>
            <MenuItem value="2">Whole Class by Months (Counts and Percentages)</MenuItem>
            {/* <MenuItem value="3">Particular Student</MenuItem>
            <MenuItem value="4">Whole Class with Date Range</MenuItem> */}
          </Select>
        )}

        {/* Step 2 and beyond */}
        {step === 2 && (option === '1' || option === '2') && (
          <Select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            fullWidth
            sx={textFieldStyle}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="January">January</MenuItem>
            <MenuItem value="February">February</MenuItem>
            <MenuItem value="March">March</MenuItem>
            <MenuItem value="April">April</MenuItem>
            <MenuItem value="May">May</MenuItem>
            <MenuItem value="June">June</MenuItem>
            <MenuItem value="July">July</MenuItem>
            <MenuItem value="August">August</MenuItem>
            <MenuItem value="September">September</MenuItem>
            <MenuItem value="October">October</MenuItem>
            <MenuItem value="November">November</MenuItem>
            <MenuItem value="December">December</MenuItem>
          </Select>
        )}

        {step === 2 && option === '3' && (
          <Select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            fullWidth
            sx={textFieldStyle}
          >
            {students.map((student) => (
              <MenuItem key={student.id} value={student.id}>
                {student.name} ({student.id})
              </MenuItem>
            ))}
          </Select>
        )}

        {step === 2 && option === '4' && (
          <Box>
            <TextField
              type="date"
              label="Start Date"
              fullWidth
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              sx={textFieldStyle}
            />
            <TextField
              type="date"
              label="End Date"
              fullWidth
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              sx={textFieldStyle}
            />
          </Box>
        )}

        {/* Fetch Attendance Button */}
        {(step === 2 || step === 3) && (
          <Button variant="contained" onClick={handleFetchAttendance} sx={buttonStyle}>
            Fetch Attendance
          </Button>
        )}

        {/* Display Table */}
        {step === 4 && (
          <Box>
            {/* //rendering table */}
            {/* {option === '2' && renderTableForOption2()}
            {option === '1' && renderTableForOption1()} */}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Button
  variant="contained"
  onClick={() =>
    option === '1'
      ? navigate('/print', { state: { attendanceData } })
      : option === '2'
      ? navigate('/PrintSummary', { state: { attendanceData } })
      : null
  }
  sx={buttonStyle}
>
  Print
</Button>
              <Button variant="outlined" onClick={onClose} sx={{ borderRadius: 8 }}>
                Close
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Modal>
  );
};

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
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

export default PrintAttendance;
