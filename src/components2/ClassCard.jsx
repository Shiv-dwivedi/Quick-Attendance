import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import './TeacherDashboard.css'; // Import the CSS file

const ClassCard = ({ course }) => {
  const navigate = useNavigate(); // Hook to navigate programmatically

  // Function to handle click and navigate to the Class Detail page
  const handleCardClick = () => {
    navigate(`/class/${course._id}`); // Navigate to class detail page with class ID
  };

  return (
    <div className="class-card" onClick={handleCardClick}> {/* Add click handler */}
      <div className="class-card-header">
        <h3>{course.subject}</h3>
        <span className="batch-text"><strong>{course.batch}</strong></span>
      </div>
      <div className="class-card-body">
        <p><strong>Course:</strong> {course.course}</p>
        <p><strong>Subject Code:</strong> {course.subjectCode}{ course.subjectLevel}</p>
        <p><strong>Total Students:</strong> {course.studentList.length}</p>
      </div>
    </div>
  );
};

export default ClassCard;
