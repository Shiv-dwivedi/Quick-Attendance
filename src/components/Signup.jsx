// Signup.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LoginSignup.css'; // Same preferred styling
import { courseOptions } from './dataOptions'; // Import courses

const Signup = () => {
  const [userType, setUserType] = useState('Student');
  const [formData, setFormData] = useState({
    name: '',
    id: '',
    email: '',
    password: '',
    batch: '',
    course: '', 
  });

  const [faceEncoding, setFaceEncoding] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false); // Handle face capture state
  const navigate = useNavigate();

  useEffect(() => {
    setFormData({
      name: '',
      id: '',
      email: '',
      password: '',
      batch: '',
      course: '',
    });
    setFaceEncoding(null);
  }, [userType]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const captureFace = async () => {
    setIsCapturing(true); 
    try {
      const response = await axios.post('http://localhost:8000/capture');  // Flask backend
      if (response.data.encoding) {
        setFaceEncoding(response.data.encoding);
        alert('Face captured successfully!');
      } else {
        alert('No face detected. Please try again.');
      }
    } catch (error) {
      console.error('Error capturing face:', error);
      alert('Failed to capture face. Check your webcam connection.');
    } finally {
      setIsCapturing(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (userType === 'Student' && !faceEncoding) {
      alert('Please capture your face before submitting.');
      return;
    }
  
    const apiEndpoint = userType === 'Student' ? 'http://localhost:5000/api/students/register' : 'http://localhost:5000/api/teachers/register';
    const requestData = userType === 'Student' ? { ...formData, encoding: faceEncoding } : formData;
  
    try {
      await axios.post(apiEndpoint, requestData);  // Use the correct endpoint
      alert(`${userType} registered successfully!`);
      navigate('/');  // Redirect to login page
    } catch (error) {
      console.error(`Error registering ${userType.toLowerCase()}:`, error);
      alert(`Failed to register ${userType.toLowerCase()}.`);
    }
  };
  

  const generateYearList = () => {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 5;
    const endYear = currentYear + 5;
    return Array.from({ length: 11 }, (_, index) => startYear + index);
  };

  return (
    <div className="form-modal">
      <div className="form-toggle">
        <button
          style={{ backgroundColor: userType === 'Student' ? '#57B846' : '#fff', color: userType === 'Student' ? '#fff' : '#222' }}
          onClick={() => setUserType('Student')}
        >
          Student
        </button>
        <button
          style={{ backgroundColor: userType === 'Teacher' ? '#57B846' : '#fff', color: userType === 'Teacher' ? '#fff' : '#222' }}
          onClick={() => setUserType('Teacher')}
        >
          Teacher
        </button>
      </div>

      {userType === 'Student' && (
        <div id="student-form">
          <form onSubmit={handleSubmit}>
            <input type="text" name="name" placeholder="Enter Name" value={formData.name} onChange={handleInputChange} required />
            <input type="text" name="id" placeholder="Enter Student ID" value={formData.id} onChange={handleInputChange} required />
            <input type="email" name="email" placeholder="Enter Email" value={formData.email} onChange={handleInputChange} required />
            <input type="password" name="password" placeholder="Enter Password" value={formData.password} onChange={handleInputChange} required />
            
            <select name="batch" value={formData.batch} onChange={handleInputChange} required>
              <option value="">Select Batch Year</option>
              {generateYearList().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select name="course" value={formData.course} onChange={handleInputChange} required>
              <option value="">Select Course</option>
              {courseOptions.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>

            <button type="button" onClick={captureFace} className="btn login" disabled={isCapturing}>
              {isCapturing ? 'Capturing...' : 'Capture Face'}
            </button>
            <button type="submit" className="btn login">Register</button>
            <p><strong>Already Registered?</strong> <a href="/">Log-in</a></p>
          </form>
        </div>
      )}

      {userType === 'Teacher' && (
        <div id="teacher-form">
          <form onSubmit={handleSubmit}>
            <input type="text" name="name" placeholder="Enter Name" value={formData.name} onChange={handleInputChange} required />
            <input type="text" name="id" placeholder="Enter Teacher ID" value={formData.id} onChange={handleInputChange} required />
            <input type="email" name="email" placeholder="Enter Email" value={formData.email} onChange={handleInputChange} required />
            <input type="password" name="password" placeholder="Enter Password" value={formData.password} onChange={handleInputChange} required />
            <button type="submit" className="btn signup">Create Account</button>
            <p><strong>Already Registered?</strong> <a href="/">Log-in</a></p>
          </form>
        </div>
      )}
    </div>
  );
};

export default Signup;
