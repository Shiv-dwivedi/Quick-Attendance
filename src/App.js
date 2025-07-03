import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import ClassDetailPage from './components/ClassDetailPage';
import StudentClass from './components/StudentClass';
import PrintPage from './components/PrintPage';
import PrintSummary from './components/PrintSummary';


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
          <Route path="/Studentclass/:classId" element={<StudentClass />}/>
          <Route path="/class/:classId" element={<ClassDetailPage />}/>
          <Route path="/print" element={<PrintPage />} />
          <Route path="/PrintSummary" element={<PrintSummary />} />
        </Routes>

      </div>
    </Router>
  );
}

export default App;
