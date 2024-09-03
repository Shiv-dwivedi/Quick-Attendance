import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './LoginSignup.css'; // Create a separate CSS file for styles

const Signup = () => {
  const [userType, setUserType] = useState('Student');
  const [formData, setFormData] = useState({
    name: '',
    id: '',
    email: '',
    password: '',
    batch: '',
  });
  const [faceEncoding, setFaceEncoding] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    setFormData({
      name: '',
      id: '',
      email: '',
      password: '',
      batch: '',
    });
    setFaceEncoding(null);
  }, [userType]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const captureFace = async () => {
    try {
      const response = await axios.post('http://localhost:5001/capture');
      if (response.data.encoding) {
        setFaceEncoding(response.data.encoding);
        alert('Face captured successfully!');
      } else {
        alert('No face detected. Please try again.');
      }
    } catch (error) {
      console.error('Error capturing face:', error);
      alert('Failed to capture face.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userType === 'Student') {
      if (!faceEncoding) {
        alert('Please capture your face before submitting.');
        return;
      }

      try {
        await axios.post('http://localhost:5000/api/students/register', { ...formData, encoding: faceEncoding });
        alert('Student registered successfully!');
        navigate('/'); // Redirect to login page
      } catch (error) {
        console.error('Error registering student:', error);
        alert('Failed to register student.');
      }
    } else {
      try {
        await axios.post('http://localhost:5000/api/teachers/register', formData);
        alert('Teacher registered successfully!');
        navigate('/'); // Redirect to login page
      } catch (error) {
        console.error('Error registering teacher:', error);
        alert('Failed to register teacher.');
      }
    }
  };

  const generateYearList = () => {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 5;
    const endYear = currentYear + 5;
    const years = [];
    for (let year = startYear; year <= endYear; year++) {
      years.push(year);
    }
    return years;
  };

  return (
    <div className="form-modal">
      <div className="form-toggle">
        <button
          id="student-toggle"
          style={{ backgroundColor: userType === 'Student' ? '#57B846' : '#fff', color: userType === 'Student' ? '#fff' : '#222' }}
          onClick={() => setUserType('Student')}
        >
          Student
        </button>
        <button
          id="teacher-toggle"
          style={{ backgroundColor: userType === 'Teacher' ? '#57B846' : '#fff', color: userType === 'Teacher' ? '#fff' : '#222' }}
          onClick={() => setUserType('Teacher')}
        >
          Teacher
        </button>
      </div>

      {userType === 'Student' && (
        <div id="student-form">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Enter Name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="id"
              placeholder="Enter Student ID"
              value={formData.id}
              onChange={handleInputChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Enter Email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Enter Password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            <select
              name="batch"
              value={formData.batch}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Batch Year</option>
              {generateYearList().map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <button type="button" onClick={captureFace} className="btn login">Capture Face</button>
            <button type="submit" className="btn login">Register</button>
            <p><strong>Already Registered? </strong> <a href="/">Log-in</a></p>
          </form>
        </div>
      )}

      {userType === 'Teacher' && (
        <div id="teacher-form">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Enter Name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="id"
              placeholder="Enter Teacher ID"
              value={formData.id}
              onChange={handleInputChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Enter Email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Enter Password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            <button type="submit" className="btn signup">Create Account</button>
            <p><strong>Already Registered? </strong> <a href="/">Log-in</a></p>
          </form>
        </div>
      )}
    </div>
  );
};

export default Signup;
