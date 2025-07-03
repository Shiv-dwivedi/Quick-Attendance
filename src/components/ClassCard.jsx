import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TeacherDashboard.css'; // Import the CSS file

const ClassCard = ({ course, isDimmed }) => {
  const navigate = useNavigate(); // Hook to navigate programmatically

  // Function to handle click and navigate to the Class Detail page
  const handleCardClick = () => {
    navigate(`/class/${course._id}`); // Navigate to class detail page with class ID
  };

  return (
      <div 
    className={`class-card-wrapper`} 
    style={{
      position: 'relative', // Position the wrapper for absolute positioning of the badge
    }}
  >
    {/* Request Length Badge outside the course card, in front */}
    {course.requestLength > 0 && (
      <span 
        style={{
          position: 'absolute',
          top: '-10px', // Move the badge above the card
          right: '-10px', // Position it to the top-right outside the card
          backgroundColor: 'red',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '50%',
          fontSize: '14px',
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10, // Ensure it's in front of the card
        }}
      >
        {course.requestLength}
      </span>
    )}

    <div 
      className={`class-card ${isDimmed ? 'dimmed' : ''}`} 
      onClick={handleCardClick} 
      style={{
        opacity: isDimmed ? 0.5 : 1, 
        filter: isDimmed ? 'grayscale(70%)' : 'none',
      }}
    >
      <div className="class-card-header">
        <h3>{course.subject}</h3>
        <span className="batch-text"><strong>{course.batch}</strong></span>
      </div>

      <div className="class-card-body">
        <p><strong>Course:</strong> {course.course}</p>
        <p><strong>Subject Code:</strong> {course.subjectCode} {course.subjectLevel}</p>
        <p><strong>Total Students:</strong> {course.studentList.length}</p> 
        {/* {course.requestLength > 0 && (
          <p><strong>Requests:</strong> {course.requestLength}</p>
        )} */}
      </div>
    </div>
  </div>


  );
};

export default ClassCard;
