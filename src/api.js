// api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

export const getClasses = async (_id) => {
  const response = await api.get(`/classes/${_id}`); // Use api instance
  return response.data;
};

export const createClass = async (classData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.post('/classes/create', classData, { // Use api instance
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating class:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const getStudents = async (batch, course) => {
  try {
    const response = await api.get('/students', {
      params: { batch, course }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
};

export const loginTeacher = async (credentials) => {
  try {
    const response = await api.post('/teachers/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Error logging in teacher:', error);
    throw error;
  }
};
