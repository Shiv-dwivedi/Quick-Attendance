import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Box, Button, TextField, Autocomplete } from '@mui/material';

const AttendanceRequestModal = ({ onClose, classId, studentId }) => {
    const [dates, setDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [requestType, setRequestType] = useState('');

    useEffect(() => {
        // Fetch available dates from the server
        const fetchDates = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/attendance/dates/${classId}`);
                setDates(response.data.dates);
            } catch (error) {
                console.error('Error fetching attendance dates:', error);
            }
        };

        fetchDates();
    }, [classId]);

    const handleSubmit = async () => {
        if (!selectedDate || !requestType) {
            alert('Please select both a date and a request type.');
            return;
        }

        const currentDate = new Date();
        const selectedDateObject = new Date(selectedDate);

        // Validate the date based on the request type
        if (
            (requestType === 'present' || requestType === 'absent') &&
            !dates.includes(selectedDate)
        ) {
            alert('Present or Absent requests must be for a date from the available attendance records.');
            return;
        }

        if (
            requestType === 'leave' &&
            selectedDateObject < currentDate.setHours(0, 0, 0, 0)
        ) {
            alert('Leave requests must be for today or a future date.');
            return;
        }

        try {
            const response = await axios.put('http://localhost:5000/attendance/request', {
                classId,
                date: selectedDate,
                studentId,
                requestType,
            });

            alert('Attendance request updated successfully!');
            onClose();
        } catch (error) {
            console.error('Error updating attendance:', error);
            alert('Failed to update attendance. Please try again.');
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
                <h2>Request Attendance</h2>

                {/* Request Type Selection */}
                <Autocomplete
                    options={['present', 'absent', 'leave']}
                    renderInput={(params) => <TextField {...params} label="Request Type" sx={textFieldStyle} />}
                    value={requestType}
                    onChange={(event, newValue) => {
                        setRequestType(newValue);
                        setSelectedDate(null); // Reset date when request type changes
                    }}
                    fullWidth
                />

                {/* Date Selection */}
                <Autocomplete
                    options={requestType === 'leave' ? getFutureDates() : dates}
                    getOptionLabel={(option) => new Date(option).toLocaleDateString()}
                    renderInput={(params) => <TextField {...params} label="Select Date" sx={textFieldStyle} />}
                    value={selectedDate}
                    onChange={(event, newValue) => setSelectedDate(newValue)}
                    fullWidth
                />



                <Button variant="contained" onClick={handleSubmit} sx={buttonStyle}>
                    Submit Request
                </Button>
            </Box>
        </Modal>
    );

    // Helper function to generate future dates including today
    function getFutureDates() {
        const today = new Date();
        const futureDates = Array.from({ length: 30 }, (_, i) => {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
        });
        return futureDates;
    }
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

export default AttendanceRequestModal;
