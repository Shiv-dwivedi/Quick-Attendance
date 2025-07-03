import { Avatar, IconButton, TextField, Menu, MenuItem } from "@mui/material";
import { Add, Search, Logout } from "@mui/icons-material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate instead of useHistory
import "./Dashboard.css";

function TeacherHeader({ onOpenModal, onSearch }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState(null); // State to manage menu anchor
  const navigate = useNavigate(); // Use navigate for redirection

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery); // Trigger the search handler
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove the token from localStorage
    navigate("/"); // Redirect user to login page using navigate
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget); // Open the menu
  };

  const handleMenuClose = () => {
    setAnchorEl(null); // Close the menu
  };

  return (
    <div className="header">
      <div className="header__left">
        <h1>Teacher Dashboard</h1>
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
                onChange={(e) => onSearch(e.target.value)}
              />
              <IconButton className="header__searchButton">
                <Search />
              </IconButton>
            </div>

      <div className="header__right">
        <IconButton onClick={onOpenModal} className="header__addButton">
          <Add />
        </IconButton>

        {/* Update Avatar with image from URL */}
        <Avatar
          className="header__avatar"
          onClick={handleMenuOpen} // Open the menu when avatar is clicked
          src="https://envs.sh/44-.jpg" // Use the image URL
          alt="Teacher Avatar"
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

export default TeacherHeader;
