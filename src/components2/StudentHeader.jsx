import { Avatar, IconButton, TextField, Menu, MenuItem } from "@mui/material";
import { Search, Logout } from "@mui/icons-material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import "./Dashboard.css";

function StudentHeader({ userRole }) {  // Receive userRole as a prop
  const [anchorEl, setAnchorEl] = useState(null); // State for managing menu anchor
  const navigate = useNavigate(); // Hook for navigation

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget); // Open the menu when avatar is clicked
  };

  const handleMenuClose = () => {
    setAnchorEl(null); // Close the menu
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear the token from localStorage
    navigate("/"); // Redirect to login page
  };

  return (
    <div className="header">
      <div className="header__left">
        <h1>{userRole === 'teacher' ? 'Teacher Dashboard' : 'Student Dashboard'}</h1> {/* Change heading based on role */}
      </div>

      <div className="header__center">
        <TextField
          placeholder="Search"
          size="small"
          variant="outlined"
          className="header__searchInput"
          InputProps={{
            style: {
              borderRadius: "20px",
              backgroundColor: "#ebebeb",
              padding: "5px",
              marginRight: "5px",
            },
            disableUnderline: true,
          }}
          sx={{
            fieldset: {
              border: "2px solid #57b846",
            },
          }}
        />
        <IconButton className="header__searchButton">
          <Search />
        </IconButton>
      </div>

      <div className="header__right">
        {/* No Add button for student */}
        <Avatar
          className="header__avatar"
          onClick={handleMenuOpen} // Open the menu when avatar is clicked
          src="https://envs.sh/44-.jpg" // Use the image URL for the avatar
          alt="Student Avatar"
        />

        {/* Dropdown menu for logout */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)} // Check if the menu should be open
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleLogout}>
            <Logout style={{ marginRight: "10px" }} />
            Logout
          </MenuItem>
        </Menu>
      </div>
    </div>
  );
}

export default StudentHeader;
