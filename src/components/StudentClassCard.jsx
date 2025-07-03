import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TeacherDashboard.css';

const ClassCard = ({ course, percentage, studentId }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/Studentclass/${course._id}`, { state: { studentId } });
  };

  const radius = 50; // Radius of the circle
  const stroke = 8; // Thickness of the stroke
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = 2 * Math.PI * normalizedRadius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 75) return '#4CAF50'; // Green for 75% and above
    if (percentage >= 50) return '#FF9800'; // Orange for 50%-74%
    return '#F44336'; // Red for below 50%
  };

  // Show only the percentage before the decimal
  const percentageBeforeDot = Math.floor(percentage); // This truncates the decimals

  return (
    <div className="class-card" onClick={handleCardClick}>
      <div className="class-card-header">
        <h3>{course.subject}</h3>
        <span className="batch-text"><strong>{course.batch}</strong></span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' , margin: '10px', marginLeft:'7px', padding:'10px'}}>
      <div className="class-card-body" style={{padding:'10px'}}>
        <p><strong>Course:</strong> {course.course}</p>
        <p><strong>Subject Code:</strong> {course.subjectCode}{course.subjectLevel}</p>
        <p><strong>Total Students:</strong> {course.studentList.length}</p>
      </div>
      <div className="circular-progress" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center',marginRight:'10px',
        flexWrap:'wrap'
       }}>
  <svg height={radius * 2 } width={radius * 2 }>
    <circle
      stroke="#e6e6e6"
      fill="transparent"
      strokeWidth={stroke } // Reduce stroke width by 1.2
      r={normalizedRadius } // Reduce the radius by 1.2
      cx={radius } // Adjust the center position for the smaller size
      cy={radius } // Adjust the center position for the smaller size
    />
    <circle
      stroke={getColor()}
      fill="transparent"
      strokeWidth={stroke } // Reduce stroke width by 1.2
      r={normalizedRadius } // Reduce the radius by 1.2
      cx={radius } // Adjust the center position for the smaller size
      cy={radius } // Adjust the center position for the smaller size
      style={{
        strokeDasharray: circumference , // Adjust strokeDasharray accordingly
        strokeDashoffset,
        transition: 'stroke-dashoffset 0.35s, stroke 0.35s',
      }}
    />
  </svg>
  <div className="percentage-text" style={{ color: getColor(), position: 'absolute' }}>
    {percentageBeforeDot}% {/* Display only the integer part */}
  </div>
</div>
</div>
    </div>
  );
};

export default ClassCard;
