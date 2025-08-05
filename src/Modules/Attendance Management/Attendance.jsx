// import React, { useState } from 'react';
// import {
//   Box, Typography, Select, MenuItem, Button, Table, TableBody, TableCell,
//   TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, IconButton,
// } from '@mui/material';
// import ExportCSVButton from "../../Components/Export to CSV/ExportCSVButton";
// import CloseIcon from '@mui/icons-material/Close';

// const Attendance = () => {
//   const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
//   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [openModal, setOpenModal] = useState(false);

//   const handleDateClick = (day) => {
//     if (day) {
//       setSelectedDate(`${selectedMonth} ${day}, ${selectedYear}`);
//       setOpenModal(true);
//     }
//   };

//   const handleCloseModal = () => {
//     setOpenModal(false);
//   };
// const months = [
//   "January", "February", "March", "April", "May", "June",
//   "July", "August", "September", "October", "November", "December"
// ];

//   const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
// const currentYear = new Date().getFullYear();
// const years = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);

//  const getDaysInMonth = (month, year) => {
//   return new Date(year, month + 1, 0).getDate();
// };

// const getStartDay = (month, year) => {
//   const day = new Date(year, month, 1).getDay(); // Sunday = 0
//   return (day + 6) % 7; // Convert to Monday = 0
// };


//   const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
//   const startDay = getStartDay(selectedMonth, selectedYear);

//   const calendarCells = [];
//   for (let i = 0; i < startDay; i++) calendarCells.push('');
//   for (let i = 1; i <= daysInMonth; i++) calendarCells.push(i);
//   while (calendarCells.length % 7 !== 0) calendarCells.push('');

//   const weeks = [];
//   for (let i = 0; i < calendarCells.length; i += 7) {
//     weeks.push(calendarCells.slice(i, i + 7));
//   }
//  const csvHeaders = [
//     { label: "Monday", key: "Mon" },
//     { label: "Tuesday", key: "Tue" },
//     { label: "Wednesday", key: "Wed" },
//     { label: "Thursday", key: "Thu" },
//     { label: "Friday", key: "Fri" },
//     { label: "Saturday", key: "Sat" },
//     { label: "Sunday", key: "Sun" },
//   ];

//   return (
//     <Box>
//          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
//                 {/* Left: Heading */}
//                <Typography variant="h4">Attendance</Typography>

//                     {/* Center: Dropdowns */}
//                     <Box display="flex" gap={1} justifyContent="center" alignItems="center">
//                         <Select
//                     value={selectedMonth}
//                     onChange={(e) => setSelectedMonth(e.target.value)}
//                     size="small"
//                     >
//                     {months.map((month, index) => (
//                         <MenuItem key={month} value={index}>
//                         {month}
//                         </MenuItem>
//                     ))}
//                     </Select>

//                         <Select
//                         value={selectedYear}
//                         onChange={(e) => setSelectedYear(e.target.value)}
//                         size="small"
//                         >
//                         {years.map((year) => (
//                             <MenuItem key={year} value={year}>
//                             {year}
//                             </MenuItem>
//                         ))}
//                         </Select>
//                     </Box>

//             {/* Right: Export button */}
//             <ExportCSVButton
//                 data={weeks}
//                 filename="Assets.csv"
//                 headers={csvHeaders}
//             />
//          </Box>

//         <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
//         <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//             Attendance Details - {selectedDate}
//             <IconButton onClick={handleCloseModal}>
//             <CloseIcon />
//             </IconButton>
//         </DialogTitle>
//         <DialogContent>
//             <TableContainer>
//             <Table>
//                 <TableHead>
//                 <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
//                     <TableCell><strong>Employee Name</strong></TableCell>
//                     <TableCell><strong>Check In</strong></TableCell>
//                     <TableCell><strong>Check Out</strong></TableCell>
//                     <TableCell><strong>Working Time</strong></TableCell>
//                     <TableCell><strong>Status</strong></TableCell>
//                 </TableRow>
//                 </TableHead>
//                 <TableBody>
//                 <TableRow>
//                     <TableCell colSpan={5} align="center">No data</TableCell>
//                 </TableRow>
//                 </TableBody>
//             </Table>
//             </TableContainer>
//         </DialogContent>
//         </Dialog>


//       {/* Calendar Table */}
//       <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
//         <Table>
//           <TableHead>
//             <TableRow>
//               {daysOfWeek.map((day) => (
//                 <TableCell key={day} align="center" sx={{ fontWeight: 'bold' }}>
//                   {day}
//                 </TableCell>
//               ))}
//             </TableRow>
//           </TableHead>
//        <TableBody>
//         {weeks.map((week, weekIndex) => (
//             <TableRow key={weekIndex}>
//             {week.map((day, dayIndex) => {
//                 const isSun = dayIndex === 6; // Sunday column
//                 return (
//           <TableCell
//             key={dayIndex}
//             align="center"
//             sx={{
//               border: '1px solid #ccc',
//               height: 40,
//               verticalAlign: 'top',
//               backgroundColor: isSun ? '#f7f6f6ff' : 'inherit', // light red for Sunday
//             }}
//           >
//             {day && (
//               <>
//             <Typography
//             fontWeight="bold"
//             mb={0.5}
//             sx={{ cursor: day ? 'pointer' : 'default' }}
//             onClick={() => handleDateClick(day)}
//             >
//             {day}
//                     </Typography>
//                         {!isSun && (
//                         <>
//                             <Typography variant="body2" color="green">Present: 0</Typography>
//                             <Typography variant="body2" color="red">Absent: 7</Typography>
//                         </>
//                         )}
//                     </>
//                     )}
//                 </TableCell>
//                 );
//             })}
//             </TableRow>
//         ))}
//         </TableBody>



//         </Table>
//       </TableContainer>
//     </Box>
//   );
// };

// export default Attendance;
