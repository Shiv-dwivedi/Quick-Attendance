import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LoginSignup.css'; // Using the same CSS file

const Login = () => {
  const [userType, setUserType] = useState('Student');
  const [formData, setFormData] = useState({
    id: '',
    password: ''
  });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const endpoint = userType === 'Student' 
        ? 'http://localhost:5000/api/students/login' 
        : 'http://localhost:5000/api/teachers/login';

      const response = await axios.post(endpoint, formData);
      alert(`${userType} logged in successfully!`);

      if (userType === 'Student') {
        navigate('/student-dashboard', { state: { userData: response.data } }); // Redirect to student dashboard
      } else {
        navigate('/teacher-dashboard', { state: { userData: response.data } }); // Redirect to teacher dashboard
      }
    } catch (error) {
      console.error(`Error logging in ${userType.toLowerCase()}:`, error);
      alert('Failed to log in.');
    }
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

      <div id={`${userType.toLowerCase()}-login-form`}>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="id"
            placeholder={`Enter ${userType === 'Student' ? 'Student' : 'Employee'} ID`}
            value={formData.id}
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
          <button type="submit" className="btn login">Log In</button>
          <p><strong>Not Registered?</strong> <a href="/signup">Sign-up</a></p>
        </form>
      </div>
    </div>
  );
};

export default Login;
