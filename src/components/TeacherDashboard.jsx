import React, { useEffect, useState } from "react";
import Header from "./TeacherHeader";
import ClassCard from "./ClassCard";
import CreateClassModal from "./CreateClassModal"; // Import the modal component
import "./TeacherDashboard.css";
import axios from "axios";

const TeacherDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCourses, setFilteredCourses] = useState([]); // State to manage filtered courses
  const [isModalOpen, setModalOpen] = useState(false); // State to manage modal visibility
  const [loading, setLoading] = useState(true);

  // Fetch the classes from the backend API
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/classes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        console.log("API response:", response.data);
        setCourses(response.data); // Set original course data
        setFilteredCourses(response.data); // Initialize filteredCourses with all courses
  
        // Fetch attendance requests for each course and update the courses list
        await Promise.all(response.data.map(async (course) => {
          const requestResponse = await axios.get(
            // `http://localhost:5000/teacher/attendance/requests/${course._id}`,
          );
  
          // Check if there are any requests, if not set requestLength to 0
          const requestCount = requestResponse.data.requests.length;
  
          // Update the course with the request count (0 if no requests)
          course.requestLength = requestCount;
  
          // Set courses after request count update
          setCourses((prevCourses) => 
            prevCourses.map((existingCourse) => 
              existingCourse._id === course._id ? course : existingCourse
            )
          );
        }));
      } catch (error) {
        console.error("Error fetching classes:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchClasses();
  }, []);
  

  // Function to handle search
  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue.toLowerCase());

    // Filter courses based on the search term
    const filtered = courses.filter((course) =>
      course.subject.toLowerCase().includes(searchValue.toLowerCase()) ||
      course.subjectCode.toLowerCase().includes(searchValue.toLowerCase()) ||
      course.subjectLevel.toLowerCase().includes(searchValue.toLowerCase()) ||
      course.course.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredCourses(filtered);
  };

  // Function to handle modal open
  const handleOpenModal = () => {
    setModalOpen(true);
  };

  // Function to handle modal close
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // Function to handle class creation (called when modal form is submitted)
  const handleCreateClass = async (newClassData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/classes",
        newClassData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Class created:", response.data);
      setCourses((prevCourses) => [...prevCourses, response.data]); // Update courses
      setFilteredCourses((prevCourses) => [...prevCourses, response.data]); // Update filtered courses
      setModalOpen(false); // Close modal
    } catch (error) {
      console.error("Error creating class:", error);
    }
  };

  return (
    <div className="app-container">
      <div className="main-content">
        <Header
          onOpenModal={handleOpenModal} // Pass modal open handler to Header
          onSearch={handleSearch} // Pass search handler to Header
        />
        <div className="courses-grid">
          {filteredCourses.map((course) => (
            <ClassCard key={course._id} course={course} />
          ))}
        </div>
      </div>

      {/* Render the modal */}
      {isModalOpen && (
        <CreateClassModal
          onClose={handleCloseModal} // Pass close handler to modal
          onCreate={handleCreateClass} // Pass class creation handler to modal
        />
      )}
    </div>
  );
};

export default TeacherDashboard;
