import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom'; // Import useLocation to access state
import Header from './StudentHeader';
import ClassCard from './StudentClassCard';
import './TeacherDashboard.css';
import axios from 'axios';

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);

  // Get studentId from location state
  const location = useLocation();
  const { studentId } = location.state.userData;

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/student/classes/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };

    fetchClasses();
  }, [studentId]);

  return (
    <div className="app-container">
      <div className="main-content">
        <Header userRole="student" />

        <div className="courses-grid">
          {courses.map((course) => (
            <ClassCard 
              key={course._id} 
              course={course} 
              percentage={course.attendancePercentage}  // Pass percentage here
              studentId={studentId} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
