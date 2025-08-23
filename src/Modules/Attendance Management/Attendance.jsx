import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Select, MenuItem, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExportCSVButton from "../../Components/Export to CSV/ExportCSVButton";
import { useSelector } from 'react-redux';
import { getAttendanceData } from '../../Services/AttendanceService';
import { getHolidayData } from '../../Services/HolidayService';

const Attendance = () => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [attendanceData, setAttendanceData] = useState([]);
    const [holidayData, setHolidayData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const officeId = useSelector((state) => state.user.officeId);

    useEffect(() => {
        if (officeId) {
            fetchAttendanceData();
            fetchHolidayList();
        }
    }, [selectedMonth, selectedYear, officeId]);

    const fetchAttendanceData = async () => {
        const yearMonth = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
        const data = await getAttendanceData(officeId, yearMonth);
        setAttendanceData(data);
    };

    const fetchHolidayList = async () => {
        const holidays = await getHolidayData(selectedYear, selectedMonth + 1);
        setHolidayData(holidays);
    };

    const handleDateClick = (day) => {
        if (day) {
            const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            setSelectedDate(dateStr);
            setOpenModal(true);
        }
    };

    const handleCloseModal = () => setOpenModal(false);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);

    const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
    const getStartDay = (month, year) => (new Date(year, month, 1).getDay() + 6) % 7;

    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const startDay = getStartDay(selectedMonth, selectedYear);

    const calendarCells = [];
    for (let i = 0; i < startDay; i++) calendarCells.push('');
    for (let i = 1; i <= daysInMonth; i++) calendarCells.push(i);
    while (calendarCells.length % 7 !== 0) calendarCells.push('');

    const weeks = [];
    for (let i = 0; i < calendarCells.length; i += 7) {
        weeks.push(calendarCells.slice(i, i + 7));
    }

    const getAttendanceByDate = (dateStr) =>
        attendanceData.filter(record => record.punchDate.startsWith(dateStr));

    const generateAttendanceSummary = () => {
        const employeeMap = {};

        attendanceData.forEach(record => {
            const { employeeName, totalWorkingTime } = record;

            if (!employeeMap[employeeName]) {
                employeeMap[employeeName] = {
                    employeeName,
                    totalWorkingDays: 0,
                    present: 0,
                    absent: 0,
                    leave: 0,
                };
            }

            const emp = employeeMap[employeeName];

            // Count working day only if it's not a weekend or holiday
            if (!['Holiday', 'Weekend'].includes(totalWorkingTime)) {
                emp.totalWorkingDays += 1;
            }

            if (totalWorkingTime === 'Absent') emp.absent += 1;
            else if (totalWorkingTime === 'Leave') emp.leave += 1;
            else if (totalWorkingTime && !['Absent', 'Leave', 'Holiday', 'Weekend'].includes(totalWorkingTime)) emp.present += 1;
        });

        return Object.values(employeeMap);
    };

    const summaryCSVHeaders = [
        { label: "Employee Name", key: "employeeName" },
        { label: "Total Working Days", key: "totalWorkingDays" },
        { label: "Present Days", key: "present" },
        { label: "Absent Days", key: "absent" },
        { label: "Leave Days", key: "leave" },
    ];


    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h4">Attendance</Typography>

                <Box display="flex" gap={1} alignItems="center">
                    <Select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} size="small">
                        {months.map((month, index) => (
                            <MenuItem key={month} value={index}>{month}</MenuItem>
                        ))}
                    </Select>

                    <Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} size="small">
                        {years.map((year) => (
                            <MenuItem key={year} value={year}>{year}</MenuItem>
                        ))}
                    </Select>
                </Box>

                <ExportCSVButton
                    data={generateAttendanceSummary()}
                    filename={`Attendance_Summary_${selectedYear}-${selectedMonth + 1}.csv`}
                    headers={summaryCSVHeaders}
                />
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            {daysOfWeek.map((day) => (
                                <TableCell key={day} align="center" sx={{ fontWeight: 'bold' }}>{day}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {weeks.map((week, weekIndex) => (
                            <TableRow key={weekIndex}>
                                {week.map((day, dayIndex) => {
                                    const dateStr = day ? `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
                                    const dayData = getAttendanceByDate(dateStr);

                                    const holidayEntryFromAPI = holidayData.find(h => h.holidayDate.startsWith(dateStr));
                                    const holidayEntry = dayData.find(d => d.totalWorkingTime === 'Holiday');
                                    const isHoliday = !!holidayEntry || !!holidayEntryFromAPI;
                                    const holidayName = holidayEntry?.status || holidayEntryFromAPI?.description || "Holiday";

                                    const presentCount = dayData.filter(d =>
                                        d.totalWorkingTime &&
                                        !['Absent', 'Leave', 'Holiday'].includes(d.totalWorkingTime)
                                    ).length;
                                    const absentCount = dayData.filter(d => d.totalWorkingTime === 'Absent').length;
                                    const leaveCount = dayData.filter(d => d.totalWorkingTime === 'Leave').length;

                                    return (
                                        <TableCell
                                            key={dayIndex}
                                            align="center"
                                            sx={{
                                                border: '1px solid #ccc',
                                                height: 40,
                                                verticalAlign: 'top',
                                            }}
                                        >
                                            {day && (
                                                <>
                                                    <Typography
                                                        fontWeight="bold"
                                                        mb={0.5}
                                                        sx={{ cursor: 'pointer' }}
                                                        onClick={() => handleDateClick(day)}
                                                    >
                                                        {day}
                                                    </Typography>

                                                    {isHoliday ? (
                                                        <Typography
                                                            color="blue"
                                                            sx={{
                                                                fontWeight: 'bold',
                                                                fontSize: '0.95rem',
                                                                wordWrap: 'break-word',
                                                                whiteSpace: 'normal',
                                                                lineHeight: 1.3,
                                                            }}
                                                        >
                                                            {holidayName}
                                                        </Typography>
                                                    ) : (
                                                        <>
                                                            <Typography variant="body2" color="green">Present: {presentCount}</Typography>
                                                            <Typography variant="body2" color="red">Absent: {absentCount}</Typography>
                                                            <Typography variant="body2" color="orange">Leave: {leaveCount}</Typography>
                                                        </>

                                                    )}
                                                </>
                                            )}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal */}
            <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Attendance Details - {selectedDate}
                    <IconButton onClick={handleCloseModal}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                                    <TableCell><strong>Employee Name</strong></TableCell>
                                    <TableCell><strong>Check In</strong></TableCell>
                                    <TableCell><strong>Check Out</strong></TableCell>
                                    <TableCell><strong>Working Time</strong></TableCell>
                                    <TableCell><strong>Status</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(getAttendanceByDate(selectedDate) || []).length > 0 ? (
                                    getAttendanceByDate(selectedDate).map((record, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{record.employeeName}</TableCell>
                                            <TableCell>{record.minCheckIn || '-'}</TableCell>
                                            <TableCell>{record.maxCheckOut || '-'}</TableCell>
                                            <TableCell>{record.totalWorkingTime}</TableCell>
                                            <TableCell>{record.status || '-'}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">No data</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default Attendance;
