import React, { useState, useEffect } from 'react';
import {
  Button,
  Modal,
  Box,
  TextField,
  MenuItem,
  Select,
  Popover,
  FormControl,
  InputLabel,
  IconButton,
  Grid,
} from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EditIcon from '@mui/icons-material/Edit';
import './CalendarComponent.css';

const CalendarComponent = ({ onDateChange }) => {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [attendance, setAttendance] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [newEvent, setNewEvent] = useState({ name: '', startTime: '', endTime: '', color: '', date: '' });
  const [month, setMonth] = useState(date.getMonth());
  const [year, setYear] = useState(date.getFullYear());
  const [autoSelected, setAutoSelected] = useState(false); // Track if auto-select has been done

  useEffect(() => {
    if (!autoSelected) { // Only run if auto-select has not been triggered
      const timer = setTimeout(() => {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        setSelectedDay(todayStr);
        onDateChange(today); // Call the callback with today's date
        setAutoSelected(true); // Prevent future auto-selections
      }, 300);

      return () => clearTimeout(timer); // Clean up timer on unmount
    }
  }, [autoSelected, onDateChange]);

  const renderEvents = (day) => {
    const eventKey = day.toISOString().split('T')[0];
    return events[eventKey] ? true : false;
  };

  const renderAttendance = (day) => {
    const dayKey = day.toISOString().split('T')[0];
    return attendance.includes(dayKey);
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(month, year);
  const firstDay = getFirstDayOfMonth(month, year);

  const handleDayClick = (event, day) => {
    const selectedDate = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    setSelectedDay(selectedDate.toISOString().split('T')[0]);
    onDateChange(selectedDate); // Call the callback with the selected day
    setAutoSelected(true); // Stop future auto-selections
    console.log('Selected day:', selectedDate);
  };

  const handleRightClick = (event, day) => {
    event.preventDefault(); // Prevent the default context menu from appearing
    const selectedDate = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    setAnchorEl(event.currentTarget);
    setSelectedDay(selectedDate.toISOString().split('T')[0]);
    console.log('Right-clicked on day:', selectedDate);
  };

  const closePopover = () => {
    setAnchorEl(null);
  };

  const openEventModal = (day) => {
    setNewEvent({ ...newEvent, date: day });
  };

  const handleCreateEvent = () => {
    const { date, name, startTime, endTime, color } = newEvent;
    setEvents({ ...events, [date]: { name, startTime, endTime, color } });
    setNewEvent({ name: '', startTime: '', endTime: '', color: '', date: '' });
  };

  const renderDays = () => {
    return (

      <>
        {Array.from({ length: firstDay }).map((_, index) => (
          <div key={index} className="calendar-day empty"></div>
        ))}
        
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const currentDay = index + 1;
          const currentDate = new Date(year, month, currentDay);
          const eventExists = renderEvents(currentDate);
          const isAttendanceTaken = renderAttendance(currentDate);
          const isToday = currentDate.toDateString() === new Date().toDateString(); // Check if current date is today
          
          return (
            <div
              key={currentDay}
              className={`calendar-day ${selectedDay === currentDate.toISOString().split('T')[0] ? 'selected-day' : ''} ${isToday ? 'today' : ''}`}
              onClick={(e) => handleDayClick(e, currentDate)} // Left-click for date selection
              onContextMenu={(e) => handleRightClick(e, currentDate)} // Right-click for popover
            >
              <div className="date">
                {currentDay}
                {eventExists && <EventAvailableIcon className="attendance-icon" />}
              </div>
            </div>
          );
        })}
      </>
    );
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const handleMonthChange = (event) => {
    setMonth(event.target.value);
    setDate(new Date(year, event.target.value));
  };

  const handleYearChange = (event) => {
    setYear(event.target.value);
    setDate(new Date(event.target.value, month));
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <FormControl variant="outlined" className="dropdown">
          <Select value={month} onChange={handleMonthChange}>
            {Array.from({ length: 12 }).map((_, i) => (
              <MenuItem key={i} value={i}>
                {new Date(0, i).toLocaleString('default', { month: 'long' })}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl variant="outlined" className="dropdown">
          <Select value={year} onChange={handleYearChange}>
            {Array.from({ length: 10 }).map((_, i) => (
              <MenuItem key={i} value={year - 5 + i}>
                {year - 5 + i}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <div className="weekdays">
        <div>MON</div>
        <div>TUE</div>
        <div>WED</div>
        <div>THU</div>
        <div>FRI</div>
        <div>SAT</div>
        <div>SUN</div>
      </div>

      <div className="calendar-grid">{renderDays()}</div>

      {/* Event Details Popover */}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={closePopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box p={2}>
          <h4>Event on {selectedDay}</h4>
          {events[selectedDay] ? (
            <div>
              <p>{events[selectedDay].name}</p>
              <p>{events[selectedDay].startTime} - {events[selectedDay].endTime}</p>
              <p>Color: {events[selectedDay].color}</p>
            </div>
          ) : (
            <p>No events for this day</p>
          )}
          <IconButton onClick={() => openEventModal(selectedDay)}>
            <EditIcon />
          </IconButton>
        </Box>
      </Popover>

      {/* Modal for creating events */}
      <Modal
        open={Boolean(newEvent.date)}
        onClose={() => setNewEvent({ name: '', startTime: '', endTime: '', color: '', date: '' })}
        disableScrollLock // This keeps the background scrollable
      >
        <Box
          className="modal-box"
          sx={{
            maxHeight: '80vh', // Ensure the modal does not occupy more than 80% of the view height
            overflowY: 'auto', // Enable scrolling within the modal if content overflows
            p: 4,
            backgroundColor: 'white',
            borderRadius: 2,
          }}
        >
          <h3>Create/Edit Event for {newEvent.date}</h3>
          <TextField
            label="Event Name"
            fullWidth
            margin="normal"
            value={newEvent.name}
            onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Start Time"
                type="time"
                fullWidth
                margin="normal"
                value={newEvent.startTime}
                onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="End Time"
                type="time"
                fullWidth
                margin="normal"
                value={newEvent.endTime}
                onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
          <FormControl fullWidth margin="normal">
            <InputLabel>Event Color</InputLabel>
            <Select
              value={newEvent.color}
              onChange={(e) => setNewEvent({ ...newEvent, color: e.target.value })}
            >
              <MenuItem value="blue">Blue</MenuItem>
              <MenuItem value="green">Green</MenuItem>
              <MenuItem value="red">Red</MenuItem>
              <MenuItem value="purple">Purple</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" onClick={handleCreateEvent}>
            Save Event
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default CalendarComponent;
