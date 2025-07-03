import React, { useState } from "react";
import { Avatar, IconButton, TextField, Menu, MenuItem } from "@mui/material";
import { Search, Logout } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function StudentHeader({ userRole, onSearch }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="header">
      <div className="header__left">
        <h1>{userRole === "teacher" ? "Teacher Dashboard" : "Student Dashboard"}</h1>
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
        <Avatar
          className="header__avatar"
          onClick={handleMenuOpen}
          src="https://envs.sh/44-.jpg"
          alt="Student Avatar"
        />

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
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
