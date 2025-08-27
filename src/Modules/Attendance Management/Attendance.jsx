import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Select, MenuItem, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle,
    DialogContent, IconButton, Button, TextField
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExportCSVButton from "../../Components/Export to CSV/ExportCSVButton";
import { useSelector } from 'react-redux';
import { getAttendanceData, addManualAttendance, getManualAttendance, updateManualAttendance } from '../../Services/AttendanceService';
import { getHolidayData } from '../../Services/HolidayService';
import { getAllEmployees } from '../../Services/EmployeeService';
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

const Attendance = () => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [attendanceData, setAttendanceData] = useState([]);
    const [holidayData, setHolidayData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [openImageModal, setOpenImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [openRejectDialog, setOpenRejectDialog] = useState(false);
    const [rejectRemark, setRejectRemark] = useState("");
    const [rejectRecord, setRejectRecord] = useState(null);

    const handleOpenImage = (imageBase64) => {
        setSelectedImage(`data:image/png;base64,${imageBase64}`);
        setOpenImageModal(true);
    };

    const handleCloseImage = () => {
        setOpenImageModal(false);
        setSelectedImage(null);
    };
    // Manual attendance states
    const [openManualModal, setOpenManualModal] = useState(false);
    const [manualData, setManualData] = useState([]);
    const [openManualForm, setOpenManualForm] = useState(false);
    const [manualForm, setManualForm] = useState({
        employeeId: '',
        punchDate: '',
        checkInTime: '',
        checkOutTime: '',
        gateNo: '',
        mobileNo: '',
        imageFile: null
    });

    const officeId = useSelector((state) => state.user.officeId);
    const userId = useSelector((state) => state.user.userId);

    useEffect(() => {
        if (officeId) {
            fetchAttendanceData();
            fetchHolidayList();
        }
    }, [selectedMonth, selectedYear, officeId]);

    useEffect(() => {
        const fetchEmployees = async () => {
            // Example API call, adjust as per your service
            const data = await getAllEmployees(officeId);
            //console.log(data);
            setEmployees(data);
        };
        if (officeId) {
            fetchEmployees();
        }
    }, [officeId]);

    const handleUpdateManualAttendance = async (record, action) => {
        try {
            const payload = {
                ...record,
                isApproved: action === "approve",
                isRejected: action === "reject",
                status: action === "approve" ? "Approved" : "Rejected",
                updatedBy: userId,
                updatedOn: new Date().toISOString(),
                rejectionRemark: action === "reject" ? "Rejected by admin" : "",
            };

            await updateManualAttendance(payload);
            alert(`Manual Attendance ${action === "approve" ? "Approved" : "Rejected"} Successfully!`);
            // Refresh manual data
            const data = await getManualAttendance(officeId);
            setManualData(data);
        } catch (err) {
            console.error("Error updating manual attendance", err);
        }
    };

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

    const handleOpenManualData = async () => {
        const data = await getManualAttendance(officeId);
        setManualData(data);
        setOpenManualModal(true);
    };

    const handleCloseManualData = () => setOpenManualModal(false);

    const handleOpenManualForm = () => setOpenManualForm(true);
    const handleCloseManualForm = () => setOpenManualForm(false);

    const handleManualFormChange = (e) => {
        setManualForm({ ...manualForm, [e.target.name]: e.target.value });
    };

    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = () => {
                let binary = '';
                const bytes = new Uint8Array(reader.result);
                const chunkSize = 0x8000; 
                for (let i = 0; i < bytes.length; i += chunkSize) {
                    let chunk = bytes.subarray(i, i + chunkSize);
                    binary += String.fromCharCode.apply(null, chunk);
                }
                resolve(btoa(binary)); 
            };
            reader.onerror = (err) => reject(err);
        });
    };

    const handleManualFormSubmit = async () => {
        try {
            let imageBase64 = "";

            if (manualForm.imageFile instanceof File) {
                imageBase64 = await fileToBase64(manualForm.imageFile);
            }

            const payload = {
                id: 0,
                employeeId: Number(manualForm.employeeId),
                empId: Number(manualForm.empId),
                punchDate: manualForm.punchDate ? new Date(manualForm.punchDate).toISOString() : null,
                checkInTime: manualForm.checkInTime ? new Date(manualForm.checkInTime).toISOString() : null,
                checkOutTime: manualForm.checkOutTime ? new Date(manualForm.checkOutTime).toISOString() : null,
                gateNo: manualForm.gateNo ? Number(manualForm.gateNo) : null,
                createdBy: userId,
                createdOn: new Date().toISOString(),
                updatedBy: userId,
                updatedOn: new Date().toISOString(),
                mobileNo: manualForm.mobileNo,
                status: "Pending",
                imageFile: imageBase64,
                isApproved: false,
                isRejected: false,
                rejectionRemark: "",
                officeId: officeId,
            };

            await addManualAttendance(payload);
            alert("Manual Attendance Added Successfully!");
            setOpenManualForm(false);
        } catch (err) {
            console.error("Error saving manual attendance", err);
        }
    };

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

    const dayWiseCSVHeaders = [
        { label: "Employee Name", key: "employeeName" },
        { label: "Check In", key: "minCheckIn" },
        { label: "Check Out", key: "maxCheckOut" },
        { label: "Working Time", key: "totalWorkingTime" },
        { label: "Status", key: "status" },
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

                <Box display="flex" gap={1}>
                    <ExportCSVButton
                        data={generateAttendanceSummary()}
                        filename={`Attendance_Summary_${selectedYear}-${selectedMonth + 1}.csv`}
                        headers={summaryCSVHeaders}
                    />
                    <Button variant="contained" color="primary" onClick={handleOpenManualForm}>
                        Add Manual Attendance
                    </Button>
                    <Button variant="outlined" color="secondary" onClick={handleOpenManualData}>
                        View Manual Attendance
                    </Button>
                </Box>
            </Box>

            {/* Calendar Attendance */}
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
                                    const isWeekend = dayIndex === 5 || dayIndex === 6;
                                    const presentCount = !isWeekend
                                        ? dayData.filter(d =>
                                            d.totalWorkingTime &&
                                            !['Absent', 'Leave', 'Holiday', 'Weekend'].includes(d.totalWorkingTime)
                                        ).length
                                        : 0;
                                    const absentCount = dayData.filter(d => d.totalWorkingTime === 'Absent').length;
                                    const leaveCount = dayData.filter(d => d.totalWorkingTime === 'Leave').length;

                                    return (
                                        <TableCell
                                            key={dayIndex}
                                            align="center"
                                            sx={{ border: '1px solid #ccc', height: 40, verticalAlign: 'top' }}
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
                                                        <Typography color="blue" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
                                                            {holidayName}
                                                        </Typography>
                                                    ) : (
                                                        <>
                                                            {!isWeekend && (
                                                                <Typography variant="body2" color="green">
                                                                    Present: {presentCount}
                                                                </Typography>
                                                            )}
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

            {/* Modal - Day Wise Attendance */}
            <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">Attendance Details - {selectedDate}</Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                            <ExportCSVButton
                                data={getAttendanceByDate(selectedDate)}
                                filename={`Attendance_${selectedDate}.csv`}
                                headers={dayWiseCSVHeaders}
                            />
                            <IconButton onClick={handleCloseModal}><CloseIcon /></IconButton>
                        </Box>
                    </Box>
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

            {/* Modal - Add Manual Attendance Form */}
            <Dialog open={openManualForm} onClose={handleCloseManualForm} maxWidth="sm" fullWidth>
                <DialogTitle>Add Manual Attendance</DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} mt={1}>
                        {/* Employee Dropdown */}
                        <Select
                            value={manualForm.employeeId}
                            onChange={(e) => {
                                const selectedId = e.target.value;
                                const selectedEmployee = employees.find(emp => emp.employeeId === selectedId);
                                setManualForm({
                                    ...manualForm,
                                    employeeId: selectedEmployee.employeeId,
                                    empId: selectedEmployee.employeeId,
                                    mobileNo: selectedEmployee.email || ""
                                });
                            }}
                            fullWidth
                            displayEmpty
                        >
                            <MenuItem value=""><em>Select Employee</em></MenuItem>
                            {employees.map((emp) => (
                                <MenuItem key={emp.employeeId} value={emp.employeeId}>
                                    {emp.employeeName} ({emp.employeeCode})
                                </MenuItem>
                            ))}
                        </Select>

                        {/* Auto-filled Mobile No (read only) */}
                        <TextField
                            label="Email"
                            name="email"
                            value={manualForm.mobileNo}
                            fullWidth
                            InputProps={{ readOnly: true }}
                        />

                        {/* Punch Date */}
                        <TextField
                            type="date"
                            label="Punch Date"
                            name="punchDate"
                            value={manualForm.punchDate}
                            onChange={handleManualFormChange}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />

                        {/* Check In Date & Time */}
                        <TextField
                            type="datetime-local"
                            label="Check In"
                            name="checkInTime"
                            value={manualForm.checkInTime}
                            onChange={handleManualFormChange}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />

                        {/* Check Out Date & Time */}
                        <TextField
                            type="datetime-local"
                            label="Check Out"
                            name="checkOutTime"
                            value={manualForm.checkOutTime}
                            onChange={handleManualFormChange}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />

                        <TextField label="Gate No" name="gateNo" value={manualForm.gateNo} onChange={handleManualFormChange} fullWidth />

                        {/* Image Upload */}
                        <Button
                            variant="outlined"
                            component="label"
                        >
                            Upload Image
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    setManualForm({ ...manualForm, imageFile: e.target.files[0] })
                                }
                            />
                        </Button>
                        {manualForm.imageFile && (
                            <Typography variant="body2">{manualForm.imageFile.name}</Typography>
                        )}

                        <Button variant="contained" color="primary" onClick={handleManualFormSubmit}>Submit</Button>
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Modal - View Manual Attendance */}
            <Dialog open={openManualModal} onClose={handleCloseManualData} maxWidth="xl" fullWidth>
                <DialogTitle>
                    Manual Attendance Data
                    <IconButton onClick={handleCloseManualData} sx={{ float: 'right' }}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                                    <TableCell><strong>ID</strong></TableCell>
                                    <TableCell><strong>Employee Id</strong></TableCell>
                                    <TableCell><strong>Punch Date</strong></TableCell>
                                    <TableCell><strong>Check In</strong></TableCell>
                                    <TableCell><strong>Check Out</strong></TableCell>
                                    <TableCell><strong>Gate No</strong></TableCell>
                                    <TableCell><strong>Email</strong></TableCell>
                                    <TableCell><strong>Emp Id</strong></TableCell>
                                    <TableCell><strong>Status</strong></TableCell>
                                    <TableCell><strong>Image File</strong></TableCell>
                                    <TableCell><strong>Rejection Remark</strong></TableCell>
                                    <TableCell><strong>Action</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {manualData.length > 0 ? (
                                    manualData.map((record, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{record.id}</TableCell>
                                            <TableCell>{record.employeeId}</TableCell>
                                            <TableCell>{record.punchDate}</TableCell>
                                            <TableCell>{record.checkInTime}</TableCell>
                                            <TableCell>{record.checkOutTime}</TableCell>
                                            <TableCell>{record.gateNo}</TableCell>
                                            <TableCell>{record.mobileNo}</TableCell>
                                            <TableCell>{record.empId}</TableCell>
                                            <TableCell>{record.status}</TableCell>
                                            <TableCell>
                                                {record.imageFile ? (
                                                    <>
                                                        <img
                                                            src={`data:image/png;base64,${record.imageFile}`}
                                                            alt="Attendance"
                                                            style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 4, cursor: "pointer" }}
                                                            onClick={() => handleOpenImage(record.imageFile)}
                                                        />
                                                    </>
                                                ) : (
                                                    "No Image"
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {record.isRejected ? record.rejectionRemark || "—" : "—"}
                                            </TableCell>
                                            <TableCell>
                                                {!record.isApproved && !record.isRejected ? (
                                                    <>
                                                        <IconButton color="success" onClick={() => handleUpdateManualAttendance(record, "approve")}>
                                                            <CheckCircleIcon />
                                                        </IconButton>
                                                        <IconButton
                                                            color="error"
                                                            onClick={() => {
                                                                setRejectRecord(record);
                                                                setRejectRemark(""); // reset field
                                                                setOpenRejectDialog(true);
                                                            }}
                                                        >
                                                            <CancelIcon />
                                                        </IconButton>
                                                    </>
                                                ) : record.isApproved ? (
                                                    <CheckCircleIcon color="success" />
                                                ) : (
                                                    <CancelIcon color="error" />
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={18} align="center">No manual attendance data</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
            </Dialog>
            <Dialog open={openImageModal} onClose={handleCloseImage} maxWidth="md" fullWidth>
                <DialogTitle>Image Preview</DialogTitle>
                <DialogContent sx={{ display: "flex", justifyContent: "center" }}>
                    {selectedImage && (
                        <img
                            src={selectedImage}
                            alt="Full Preview"
                            style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: 8 }}
                        />
                    )}
                </DialogContent>
            </Dialog>
            <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Reject Attendance</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Rejection Remark"
                        value={rejectRemark}
                        onChange={(e) => setRejectRemark(e.target.value)}
                        fullWidth
                        multiline
                        rows={3}
                        sx={{ mt: 2 }}
                    />
                    <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                        <Button onClick={() => setOpenRejectDialog(false)}>Cancel</Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={async () => {
                                if (!rejectRecord) return;
                                await handleUpdateManualAttendance(rejectRecord, "reject", rejectRemark);
                                setOpenRejectDialog(false);
                            }}
                        >
                            Reject
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default Attendance;