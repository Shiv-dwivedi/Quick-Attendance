import React, { useState } from 'react';
import axios from 'axios';

const TeacherDashboard = () => {
  const [recognizedStudents, setRecognizedStudents] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const handleTakeAttendance = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/start_attendance');
      const { recognized_students } = response.data;
      setRecognizedStudents(recognized_students);
      setErrorMessage('');
    } catch (error) {
      console.error('Error taking attendance:', error);
      setErrorMessage('Error taking attendance. Please try again.');
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <button onClick={handleTakeAttendance}>Take Attendance</button>
      
      <div id="video-feed">
        <img
          src="http://localhost:5001/video_feed"
          alt="Live Feed"
          style={{ width: '100%', height: 'auto', maxWidth: '600px', margin: '20px auto' }}
        />
      </div>

      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      <div id="recognized-students">
        {recognizedStudents.length > 0 ? (
          <>
            <h3>Recognized Students:</h3>
            {recognizedStudents.map((name, index) => (
              <p key={index}>{name}</p>
            ))}
          </>
        ) : (
          <p>No students recognized yet.</p>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
