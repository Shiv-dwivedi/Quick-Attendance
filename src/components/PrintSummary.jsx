import React from 'react';
import { Box, Table, TableHead, TableRow, TableCell, TableBody, Typography, Button } from '@mui/material';
import { useLocation } from 'react-router-dom';

const AttendanceSummaryPage = () => {
  const location = useLocation();
  const data = location.state?.attendanceData;

  if (!data || !data.classDetails || !data.attendanceSummary) {
    return <Typography variant="h6">Invalid or missing data.</Typography>;
  }

  const { classDetails, attendanceSummary } = data;

  // Handle the print functionality using window.print()
  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Attendance Summary</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 10mm; /* Reduced margin for better fit */
              }
              body {
                font-size: 10pt;
                line-height: 1.2; /* Reduced line spacing */
                margin: 0;
                padding: 0;
                text-align: center; /* Center the content */
              }
              .table-container {
                margin-top: 10px;
              }
              .table-container table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
              }
              .table-container th,
              .table-container td {
                border: 1px solid #ccc;
                padding: 4px 8px; /* Reduced padding */
                text-align: center;
              }
              .table-container th {
                background-color: #f0f0f0;
                font-weight: bold;
              }
              .table-container td.name {
                text-align: left; /* Left-align the student name column */
              }
              .print-button {
                display: none; /* Hide the print button when printing */
              }
              h2, h3, h4 {
                margin: 0; /* Remove margin from headings */
                padding: 0; /* Remove padding from headings */
              }
              .header {
                margin-bottom: 10px; /* Space between header and table */
                padding-top: 20px; /* Added padding above the image */
              }
              .subject-course {
                text-align: left; /* Left-align the Subject and Course info */
                margin-top: 10px;
                padding-left: 10px; /* Add padding to the left */
              }
              /* Avoid breaking inside table rows */
              .table-container table tr {
                page-break-inside: avoid;
              }
              /* Make sure header repeats on every page */
              .table-container thead {
                display: table-header-group;
              }
              /* Remove default print stuff like page number, URL, or title */
              body, html {
                -webkit-print-color-adjust: exact; /* Ensures the colors are printed correctly */
              }
              /* Remove header and footer details such as page number, URL, or title in the printed page */
              @page {
                size: A4;
                margin: 0;
              }
              * {
                box-sizing: border-box;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="https://envs.sh/lNL.png" alt="Logo" style="height: 60px; margin-bottom: 8px;" />
            <h2>SAM HIGGINBOTTOM UNIVERSITY OF AGRICULTURE, TECHNOLOGY AND SCIENCES</h2>
            <h3>PRAYAGRAJ (ALLAHABAD) - 211 007</h3>
            <h4>Attendance Summary</h4>
          </div>
          <div class="subject-course">
            <p><strong>Subject:</strong> ${classDetails.subject}</p>
            <p><strong>Course:</strong> ${classDetails.course} | <strong>Batch:</strong> ${classDetails.batch} | <strong>Semester:</strong> ${classDetails.semester}</p>
          </div>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>S.No.</th>
                  <th>Name</th>
                  <th>ID</th>
                  <th>Total Present</th>
                  <th>Total Absent</th>
                  <th>Total Classes</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                ${attendanceSummary
                  .map(
                    (student, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td class="name">${student.name}</td>
                    <td>${student.id}</td>
                    <td>${student.totalPresent}</td>
                    <td>${student.totalAbsent}</td>
                    <td>${student.totalClasses}</td>
                    <td>${student.percentage}%</td>
                  </tr>`
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
        <img
          src="https://envs.sh/lNL.png"
          alt="Logo"
          style={{ height: '80px', marginBottom: '16px', paddingTop: '20px' }} // Added padding top
        />
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', textAlign: 'center', marginBottom: '8px' }}>
          SAM HIGGINBOTTOM UNIVERSITY OF AGRICULTURE, TECHNOLOGY AND SCIENCES<br />
          PRAYAGRAJ (ALLAHABAD) - 211 007
        </Typography>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
          Attendance Summary
        </Typography>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'left' }}>
          Subject: {classDetails.subject}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'left' }}>
          Course: {classDetails.course} | Batch: {classDetails.batch} | Semester: {classDetails.semester}
        </Typography>
      </Box>

      <Table sx={{ mt: 3, border: 1, borderColor: 'grey.400' }} aria-label="Attendance Summary">
        <TableHead>
          <TableRow>
            <TableCell sx={{ backgroundColor: 'grey.200', fontWeight: 'bold', textAlign: 'center' }}>S.No.</TableCell>
            <TableCell sx={{ backgroundColor: 'grey.200', fontWeight: 'bold', textAlign: 'center' }}>Name</TableCell>
            <TableCell sx={{ backgroundColor: 'grey.200', fontWeight: 'bold', textAlign: 'center' }}>ID</TableCell>
            <TableCell sx={{ backgroundColor: 'grey.200', fontWeight: 'bold', textAlign: 'center' }}>Total Present</TableCell>
            <TableCell sx={{ backgroundColor: 'grey.200', fontWeight: 'bold', textAlign: 'center' }}>Total Absent</TableCell>
            <TableCell sx={{ backgroundColor: 'grey.200', fontWeight: 'bold', textAlign: 'center' }}>Total Classes</TableCell>
            <TableCell sx={{ backgroundColor: 'grey.200', fontWeight: 'bold', textAlign: 'center' }}>Percentage</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {attendanceSummary.map((student, index) => (
            <TableRow key={student.id} sx={{ borderBottom: 1, borderColor: 'grey.300' }}>
              <TableCell sx={{ textAlign: 'center' }}>{index + 1}</TableCell>
              <TableCell sx={{ textAlign: 'left' }}>{student.name}</TableCell>
              <TableCell sx={{ textAlign: 'center' }}>{student.id}</TableCell>
              <TableCell sx={{ textAlign: 'center' }}>{student.totalPresent}</TableCell>
              <TableCell sx={{ textAlign: 'center' }}>{student.totalAbsent}</TableCell>
              <TableCell sx={{ textAlign: 'center' }}>{student.totalClasses}</TableCell>
              <TableCell sx={{ textAlign: 'center' }}>{student.percentage}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Button
        onClick={handlePrint}
        variant="contained"
        color="primary"
        sx={{ mt: 3, display: 'block', alignSelf: 'center' }}
      >
        Print
      </Button>
    </Box>
  );
};

export default AttendanceSummaryPage;
