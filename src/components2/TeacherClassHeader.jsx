import React from "react";
import { Avatar, IconButton, TextField, Button } from "@mui/material";
import { Add, Search, Edit } from "@mui/icons-material";
import "./Dashboard.css";

function TeacherClassHeader({ onOpenModal, className, onCheckRequest, onPrintReport, onEditClass }) {
  return (
    <div className="header">
      {/* Left Section: Class Name */}
      <div className="header__left">
        <h1>{className || "Class Name"}</h1>
        <IconButton onClick={onEditClass} className="header__editClassButton">
          <Edit />
        </IconButton>
      </div>

      {/* Center Section: Search Bar */}
      <div className="header__center">
        <TextField
          placeholder="Search"
          size="small"
          variant="outlined"
          className="header__searchInput__element"
          InputProps={{
            style: {
              borderRadius: "20px",
              backgroundColor: "#ebebeb",
              padding: "5px px",
              marginRight: "10px",
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

      {/* Right Section: Buttons and Avatar */}
      <div className="header__right">
        <Button 
          variant="contained" 
          color="primary" 
          onClick={onCheckRequest} 
          className="header__checkRequestButton"
        >
          Check Request
        </Button>
        <Button 
          variant="outlined" 
          color="secondary" 
          onClick={onPrintReport} 
          className="header__printReportButton"
        >
          Print Report
        </Button>
        <IconButton onClick={onOpenModal} className="header__addButton">
          <Add />
        </IconButton>
        <Avatar className="header__avatar">A</Avatar>
      </div>
    </div>
  );
}

export default TeacherClassHeader;
