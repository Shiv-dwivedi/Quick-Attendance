import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './StudentHeader';
import ClassCard from './StudentClassCard';
import './TeacherDashboard.css';
import axios from 'axios';

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCourses, setFilteredCourses] = useState([]);

  // Get studentId from location state
  const location = useLocation();
  const { studentId } = location.state.userData;

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:5000/api/student/classes/${studentId}`, 
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setCourses(response.data);
        setFilteredCourses(response.data); // Initialize filtered courses
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };

    fetchClasses();
  }, [studentId]);

  // Handle search input
  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue.toLowerCase());

    // Filter courses based on the search term
    const filtered = courses.filter((course) =>
      course.subject.toLowerCase().includes(searchValue.toLowerCase())||
    course.subjectCode.toLowerCase().includes(searchValue.toLowerCase())||
    course.subjectLevel.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredCourses(filtered);
  };

  return (
    <div className="app-container">
      <div className="main-content">
        {/* Pass handleSearch to Header */}
        <Header userRole="student" onSearch={handleSearch} />

        <div className="courses-grid">
          {/* Use filteredCourses to display */}
          {filteredCourses.map((course) => (
            <ClassCard 
              key={course._id} 
              course={course} 
              percentage={course.attendancePercentage} 
              studentId={studentId} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
