import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Table, TableHead, TableRow, TableCell, TableBody, Box, Typography } from '@mui/material';

const PrintPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { attendanceData } = location.state || { attendanceData: [] };

  const handlePrint = () => {
    // const printWindow = window.open('', '', 'width=800,height=600');
    // const handlePrint = () => {
        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write(`
          <html>
            <head>
              <title>Attendance Data</title>
              <style>
                @media print {
                  @page {
                    size: A4 landscape;
                    margin: 10mm;
                  }
                  body {
                    font-size: 10pt;
                    line-height: 1.2;
                    margin: 0;
                    padding: 0;
                    text-align: center;
                    font-family: Arial, sans-serif;
                  }
                  .header {
                    margin-bottom: 10px;
                    padding-top: 20px;
                    text-align: center;
                  }
                  .header img {
                    height: 80px;
                    margin-bottom: 16px;
                  }
                  .header h2, .header h3 {
                    font-weight: bold;
                    margin: 0;
                    padding: 0;
                  }
                  .header h3 {
                    font-size: 1.1rem;
                  }
                  .details {
                    margin: 10px 0;
                    font-weight: bold;
                    text-align: left;
                  }
                  .table-container {
                    margin-top: 10px;
                    width: 100%;
                  }
                  table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                  }
                  th, td {
                    border: 1px solid #ccc;
                    padding: 4px 8px;
                    text-align: center;
                  }
                  th {
                    background-color: #f0f0f0;
                    font-weight: bold;
                  }
                  td.name {
                    text-align: left;
                  }
                  .table-container table tr {
                    page-break-inside: avoid;
                  }
                  .table-container thead {
                    display: table-header-group;
                  }
                  hr {
                    margin: 20px 0;
                    border: 0;
                    border-top: 2px solid #000;
                  }
                  .print-button {
                    display: none;
                  }
                  /* Hide browser-specific print information */
                  body::after {
                    content: "";
                    display: block;
                    position: absolute;
                    top: -9999px;
                  }
                }
              </style>
            </head>
            <body>
              <div class="header">
                <img src="https://envs.sh/lNL.png" alt="Logo" />
                <h2>SAM HIGGINBOTTOM UNIVERSITY OF AGRICULTURE, TECHNOLOGY AND SCIENCES</h2>
                <h3>PRAYAGRAJ (ALLAHABAD) - 211 007</h3>
                <h3>Attendance Data</h3>
              </div>
              <hr />
              <div class="details">
                <p>Subject: Mathematics</p>
                <p>Course: MATH 101 | Batch: A | Semester: 1</p>
              </div>
              <div class="table-container">
                ${attendanceData.length === 0 ? '<p>No data available for printing.</p>' : `
                  <table>
                    <thead>
                      <tr>
                        <th>S.No.</th>
                        <th>Name</th>
                        ${Array.from({ length: 31 }, (_, i) => `<th>${i + 1}</th>`).join('')}
                      </tr>
                    </thead>
                    <tbody>
                      ${attendanceData.map((row, index) => `
                        <tr>
                          <td>${index + 1}</td>
                          <td class="name">${row.name}</td>
                          ${row.attendance.map(status => `<td>${status}</td>`).join('')}
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                `}
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
          style={{ height: '80px', marginBottom: '16px' }}
        />
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', textAlign: 'center', marginBottom: '8px' }}>
          SAM HIGGINBOTTOM UNIVERSITY OF AGRICULTURE, TECHNOLOGY AND SCIENCES<br />
          PRAYAGRAJ (ALLAHABAD) - 211 007
        </Typography>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
          Attendance Data
        </Typography>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Subject: Mathematics {/* Or any subject name from your data */}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, fontWeight: 'bold' }}>
          Course: MATH 101 | Batch: A | Semester: 1
        </Typography>
      </Box>

      <Box className="table-container" sx={{ mt: 3 }}>
        {attendanceData.length === 0 ? (
          <Typography>No data available for printing.</Typography>
        ) : (
          <Table sx={{ width: '100%' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ backgroundColor: 'grey.200', fontWeight: 'bold', textAlign: 'center' }}>S.No.</TableCell>
                <TableCell sx={{ backgroundColor: 'grey.200', fontWeight: 'bold', textAlign: 'center' }}>Name</TableCell>
                {Array.from({ length: 31 }, (_, i) => (
                  <TableCell sx={{ backgroundColor: 'grey.200', fontWeight: 'bold', textAlign: 'center' }} key={i}>
                    {i + 1}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {attendanceData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ textAlign: 'center' }}>{index + 1}</TableCell>
                  <TableCell sx={{ textAlign: 'left' }}>{row.name}</TableCell>
                  {row.attendance.map((status, i) => (
                    <TableCell sx={{ textAlign: 'center' }} key={i}>
                      {status}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Box>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="contained" color="primary" onClick={handlePrint}>
          Print
        </Button>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Box>
    </Box>
  );
};

export default PrintPage;
