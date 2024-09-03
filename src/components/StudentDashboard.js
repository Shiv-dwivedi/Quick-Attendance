import React from 'react';
import { useLocation } from 'react-router-dom';

const StudentDashboard = () => {
    return (
      <div>
        {/* Embedded CSS */}
        <style>{`
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .header {
            background-color: #333;
            color: #fff;
            padding: 10px;
            text-align: center;
          }
          .header .logo {
            font-size: 20px;
            font-weight: bold;
            text-decoration: none;
            color: white;
          }
          .header-right {
            float: right;
          }
          .header-right a {
            color: white;
            padding: 14px 20px;
            text-decoration: none;
            text-align: center;
          }
          .header-right a.active {
            background-color: #04aa6d;
            color: white;
          }
          .sidebar {
            margin: 0;
            padding: 0;
            width: 200px;
            background-color: #333;
            position: fixed;
            height: 100%;
            overflow: auto;
          }
          .sidebar a {
            display: block;
            color: white;
            padding: 16px;
            text-decoration: none;
          }
          .sidebar a.active {
            background-color: #04aa6d;
            color: white;
          }
          .sidebar a:hover:not(.active) {
            background-color: #555;
            color: white;
          }
          .main-content {
            margin-left: 210px; /* Same as the width of the sidebar */
            padding: 20px;
            background-color: #f4f4f4;
            height: 100vh;
          }
          .attendance, .timetable, .announcements, .teachers-on-leave {
            background-color: white;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .attendance-card {
            display: inline-block;
            width: 45%;
            margin: 2.5%;
            padding: 10px;
            text-align: center;
            border-radius: 5px;
            color: #fff;
          }
          .attendance-card.present {
            background-color: #4CAF50;
          }
          .attendance-card.absent {
            background-color: #f44336;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #f2f2f2;
          }
          ul {
            list-style-type: none;
            padding: 0;
          }
          ul li {
            background: #eee;
            padding: 10px;
            margin-bottom: 5px;
            border-radius: 5px;
          }
        `}</style>
  
        {/* Header */}
        <header className="header">
          <a href="#" className="logo">
            Student Dashboard
          </a>
          <div className="header-right">
            <a className="active" href="#">
              Home
            </a>
            <a href="#">Profile</a>
            <a href="#">Logout</a>
          </div>
        </header>
  
        {/* Sidebar */}
        <div className="sidebar">
          <a href="#" className="active">
            Dashboard
          </a>
          <a href="#">Attendance</a>
          <a href="#">Timetable</a>
          <a href="#">Assignments</a>
          <a href="#">Exams</a>
          <a href="#">Results</a>
          <a href="#">Events</a>
          <a href="#">Announcements</a>
        </div>
  
        {/* Main Content */}
        <div className="main-content">
          {/* Attendance */}
          <div className="attendance">
            <h2>Attendance</h2>
            <div className="attendance-card present">
              <h3>Present</h3>
              <p>80%</p>
            </div>
            <div className="attendance-card absent">
              <h3>Absent</h3>
              <p>20%</p>
            </div>
          </div>
  
          {/* Timetable */}
          <div className="timetable">
            <h2>Timetable</h2>
            <table>
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Subject</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Monday</td>
                  <td>Math</td>
                  <td>10:00 - 11:00</td>
                </tr>
                <tr>
                  <td>Tuesday</td>
                  <td>Science</td>
                  <td>11:00 - 12:00</td>
                </tr>
                <tr>
                  <td>Wednesday</td>
                  <td>History</td>
                  <td>12:00 - 1:00</td>
                </tr>
              </tbody>
            </table>
          </div>
  
          {/* Announcements */}
          <div className="announcements">
            <h2>Announcements</h2>
            <ul>
              <li>School will remain closed tomorrow due to weather conditions.</li>
              <li>New assignments have been posted.</li>
              <li>Parent-teacher meeting is scheduled for next week.</li>
            </ul>
          </div>
  
          {/* Teachers On Leave */}
          <div className="teachers-on-leave">
            <h2>Teachers On Leave</h2>
            <ul>
              <li>Mr. John - Math</li>
              <li>Ms. Emily - Science</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
  
export default StudentDashboard;
