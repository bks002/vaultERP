import React, { useEffect, useState } from 'react';
import {
    Container, Typography, Button, TextField, Dialog,
    DialogTitle, DialogContent, DialogActions, Box,
    IconButton, Tooltip, Table, TableHead, TableRow,
    TableCell, TableBody, Stack, MenuItem, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useSelector } from "react-redux";
import AlertSnackbar from "../../Components/Alert/AlertSnackBar";
import { getAllEmployees } from "../../Services/EmployeeService";
import { getAllShift } from "../../Services/ShiftService";
import { getAllEmployeeShift, createEmployeeShift, deleteEmployeeShift } from "../../Services/EmployeeShift";

const EmployeeShiftPage = () => {
    const officeId = useSelector((state) => state.user.officeId);
    const userId = useSelector((state) => state.user.userId);

    const [searchQuery, setSearchQuery] = useState('');
    const [employeeShifts, setEmployeeShifts] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [alert, setAlert] = useState({ open: false, type: 'success', message: '' });

    const [selectedEmployee, setSelectedEmployee] = useState({
        employeeId: '',
        employeeName: '',
        shiftId: '',
        shiftName: '',
        dateFrom: '',
        dateTo: '',
        mobileNo: ''
    });

    useEffect(() => {
        if (officeId) {
            loadEmployeeShifts();
            loadEmployees();
            loadShifts();
        }
    }, [officeId]);

    const loadEmployeeShifts = async () => {
        try {
            const data = await getAllEmployeeShift(officeId);
            setEmployeeShifts(data);
        } catch {
            showAlert('error', 'Failed to load employee shifts');
        }
    };

    const loadEmployees = async () => {
        try {
            const data = await getAllEmployees(officeId);
            setEmployees(data);
        } catch {
            showAlert('error', 'Failed to load employees');
        }
    };

    const loadShifts = async () => {
        try {
            const data = await getAllShift(officeId);
            setShifts(data);
        } catch {
            showAlert('error', 'Failed to load shifts');
        }
    };

    const showAlert = (type, message) => {
        setAlert({ open: true, type, message });
    };

    const handleCreate = () => {
        setSelectedEmployee({
            employeeId: '',
            employeeName: '',
            shiftId: '',
            shiftName: '',
            dateFrom: '',
            dateTo: '',
            mobileNo: ''
        });
        setDialogOpen(true);
    };

    const handleView = (emp) => {
        setSelectedEmployee(emp);
        setViewOpen(true);
    };

    const handleDelete = async (emp) => {
        if (window.confirm(`Are you sure you want to delete ${emp.employeeName}?`)) {
            try {
                await deleteEmployeeShift(emp.employeeId, emp.shiftId);
                showAlert('success', 'Employee shift deleted successfully');
                loadEmployeeShifts();
            } catch {
                showAlert('error', 'Failed to delete employee shift');
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSelectedEmployee({ ...selectedEmployee, [name]: value });
    };

    const handleSave = async () => {
        const employee = employees.find(e => e.employeeId === parseInt(selectedEmployee.employeeId));
        const shift = shifts.find(s => s.shiftId === parseInt(selectedEmployee.shiftId));

        const payload = {
            employeeId: parseInt(selectedEmployee.employeeId),
            employeeName: employee?.employeeName || '',
            shiftId: parseInt(selectedEmployee.shiftId),
            shiftName: shift?.shiftName || '',
            dateFrom: new Date(selectedEmployee.dateFrom).toISOString(),
            dateTo: new Date(selectedEmployee.dateTo).toISOString(),
            isActive: true,
            mobileNo: selectedEmployee.mobileNo,
            createdBy: parseInt(userId),
            updatedBy: 0
        };

        try {
            await createEmployeeShift(payload);
            showAlert('success', 'Employee shift created successfully');
            setDialogOpen(false);
            loadEmployeeShifts();
        } catch {
            showAlert('error', 'Failed to save employee shift');
        }
    };

    const filteredList = employeeShifts.filter((item) =>
        item.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.shiftName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Container maxWidth={false}>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h4">Employee Shift</Typography>
                <Box display="flex" alignItems="center" gap={2}>
                    <TextField
                        placeholder="Search by Employee or Shift"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            )
                        }}
                        size="small"
                        sx={{ width: 300 }}
                    />
                    <Button variant="contained" onClick={handleCreate}>Add Employee Shift</Button>
                </Box>
            </Box>

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Employee Name</TableCell>
                        <TableCell>Shift Name</TableCell>
                        <TableCell>Date From</TableCell>
                        <TableCell>Date To</TableCell>
                        <TableCell align="center">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredList.length > 0 ? (
                        filteredList.map((emp, index) => (
                            <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{emp.employeeName}</TableCell>
                                <TableCell>{emp.shiftName}</TableCell>
                                <TableCell>{emp.dateFrom?.split('T')[0]}</TableCell>
                                <TableCell>{emp.dateTo?.split('T')[0]}</TableCell>
                                <TableCell align="center">
                                    <Tooltip title="View">
                                        <IconButton onClick={() => handleView(emp)} color="info">
                                            <VisibilityIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                        <IconButton onClick={() => handleDelete(emp)} color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} align="center">No employee shifts found</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Add Employee Shift</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField select label="Employee Name" name="employeeId" value={selectedEmployee.employeeId} onChange={handleChange} fullWidth>
                            {employees.map((e) => (
                                <MenuItem key={e.employeeId} value={e.employeeId}>{e.employeeName}</MenuItem>
                            ))}
                        </TextField>

                        <TextField select label="Shift Name" name="shiftId" value={selectedEmployee.shiftId} onChange={handleChange} fullWidth>
                            {shifts.map((s) => (
                                <MenuItem key={s.shiftId} value={s.shiftId}>{s.shiftName}</MenuItem>
                            ))}
                        </TextField>

                        <TextField type="date" label="Date From" name="dateFrom" value={selectedEmployee.dateFrom?.split('T')[0]} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
                        <TextField type="date" label="Date To" name="dateTo" value={selectedEmployee.dateTo?.split('T')[0]} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
                        <TextField label="Mobile Number" name="mobileNo" value={selectedEmployee.mobileNo} onChange={handleChange} fullWidth />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>Save</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Employee Shift Details</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField label="Employee Name" value={selectedEmployee.employeeName} fullWidth disabled />
                        <TextField label="Shift Name" value={selectedEmployee.shiftName} fullWidth disabled />
                        <TextField label="Date From" value={selectedEmployee.dateFrom?.split('T')[0]} fullWidth disabled />
                        <TextField label="Date To" value={selectedEmployee.dateTo?.split('T')[0]} fullWidth disabled />
                        <TextField label="Mobile Number" value={selectedEmployee.mobileNo} fullWidth disabled />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            <AlertSnackbar
                open={alert.open}
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert({ ...alert, open: false })}
            />
        </Container>
    );
};

export default EmployeeShiftPage;
