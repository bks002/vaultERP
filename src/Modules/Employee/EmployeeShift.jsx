import React, { useEffect, useState } from 'react';
import {
    Container, Typography, Button, TextField, Dialog,
    DialogTitle, DialogContent, DialogActions, Box,
    IconButton, Tooltip, Table, TableHead, TableRow,
    TableCell, TableBody, Stack, MenuItem, InputAdornment,
} from '@mui/material';
import {
    getAllEmployees
} from "../../Services/EmployeeService";
import AlertSnackbar from "../../Components/Alert/AlertSnackBar";
// import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useSelector } from "react-redux";
import { getAllShift } from '../../Services/ShiftService';
import { getAllEmployeeShift, createEmployeeShift, deleteEmployeeShift } from '../../Services/EmployeeShift';
import ExportCSVButton from '../../Components/Export to CSV/ExportCSVButton';

const EmployeeShiftPage = () => {
    const officeId = useSelector((state) => state.user.officeId);
    const userId = useSelector((state) => state.user.userId);
    const [employees, setEmployees] = useState([]);
    const [shift, setShift] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    
    const [employeeShiftList, setEmployeeShiftList] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    // const [isEdit, setIsEdit] = useState(false);

    const [selectedEmployee, setSelectedEmployee] = useState({
        employeeId: '',
        employeeName: '',
        shiftId: '',
        shiftName: '',
        dateFrom: '',
        dateTo: '',
        mobileNo: ''
    });

    const [alert, setAlert] = useState({ open: false, type: 'success', message: '' });

    useEffect(() => {
        if (officeId) {
            loadEmployeeShift();
            loadEmployees();
            loadShift();
        }
    }, [officeId]);

    const loadEmployeeShift = async () => {
        try {
            const data = await getAllEmployeeShift(officeId);
            setEmployeeShiftList(data);
        } catch {
            showAlert('error', 'Failed to load employee shift');
        }
    };

    const loadEmployees = async () => {
        try {
            const data = await getAllEmployees(officeId);
            setEmployees(data);
        } catch {
            showAlert('error', 'Failed to load employee list');
        }
    };

    const loadShift = async () => {
        try {
            const data = await getAllShift(officeId);
            setShift(data);
        } catch {
            showAlert('error', 'Failed to load Shift');
        }
    };

    const showAlert = (type, message) => {
        setAlert({ open: true, type, message });
    };

    const handleCreate = () => {
        // setIsEdit(false);
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

    // const handleEdit = (emp) => {
    //     setSelectedEmployee({ ...emp });
    //     setIsEdit(true);
    //     setDialogOpen(true);
    // };

    const handleView = (emp) => {
        setSelectedEmployee({ ...emp });
        setViewOpen(true);
    };

    const handleDelete = async (emp) => {
        if (window.confirm(`Are you sure you want to delete "${emp.employeeName}"?`)) {
            try {
                await deleteEmployeeShift(emp.employeeId, emp.shiftId);
                showAlert('success', 'Employee shift deleted successfully');
                loadEmployeeShift();
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
        const employee = employees.find(emp => emp.employeeId === parseInt(selectedEmployee.employeeId));
        const shiftData = shift.find(sh => sh.shiftId === parseInt(selectedEmployee.shiftId));

        const payload = {
            employeeId: parseInt(selectedEmployee.employeeId),
            employeeName: employee?.employeeName || '',
            shiftId: parseInt(selectedEmployee.shiftId),
            shiftName: shiftData?.shiftName || '',
            dateFrom: new Date(selectedEmployee.dateFrom).toISOString(),
            dateTo: new Date(selectedEmployee.dateTo).toISOString(),
            isActive: true,
            mobileNo: selectedEmployee.mobileNo,
            createdBy: parseInt(userId),
            updatedBy:  0
        };

        try {
            // if (isEdit) {
            //     await updateEmployeeShift(payload.employeeId, payload.shiftId, payload);
            //     showAlert('success', 'Employee shift updated successfully');
            // } else {
                await createEmployeeShift(payload);
                showAlert('success', 'Employee shift created successfully');
            // }
            setDialogOpen(false);
            loadEmployeeShift();
        } catch {
            showAlert('error', 'Failed to save employee shift');
        }
    };
    const csvHeaders = [
        { label: "Employee ID", key: "employeeId" },
        { label: "Employee Name", key: "employeeName" },
        { label: "Shift ID", key: "shiftId" },
        { label: "Shift Name", key: "shiftName" },
        { label: "Date From", key: "dateFrom" },
        { label: "Date To", key: "dateTo" },
        { label: "Mobile No", key: "mobileNo" } 
    ];  

    const filteredEmployee = employeeShiftList.filter((emp) =>
    emp.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.mobileNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.shiftName?.toLowerCase().includes(searchQuery.toLowerCase())
);

    return (
        <Container maxWidth={false}>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
    <Typography variant="h4">Employee Shift</Typography>
    
    <Box display="flex" alignItems="center" gap={2}>
        <TextField
            placeholder="Search by Employee Name, Shift"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <SearchIcon />
                    </InputAdornment>
                ),
            }}
            size="small"
            sx={{ width: 300 }}
        />
        <ExportCSVButton
            data={filteredEmployee}
            filename={`EmployeeShift.csv`}
            headers={csvHeaders}
        />
        <Button variant="contained" color="primary" onClick={handleCreate}>
            Add Employee Shift
        </Button>
    </Box>
</Box>


            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Employee Name</TableCell>
                        <TableCell>Shift</TableCell>
                        <TableCell>Date From</TableCell>
                        <TableCell>Date To</TableCell>
                        <TableCell align="center">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredEmployee.length > 0 ? (
                        filteredEmployee.map((emp, index) => (
                            <TableRow key={emp.id || index}>
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
                                    {/* <Tooltip title="Edit">
                                        <IconButton onClick={() => handleEdit(emp)} color="primary">
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip> */}
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
                            <TableCell colSpan={6} align="center">No employee shift found</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>{ 'Add Employee shift'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField select label="Employee Name" name="employeeId" value={selectedEmployee.employeeId} onChange={handleChange} fullWidth >
                            {employees.map((type) => (
                                <MenuItem key={type.employeeId} value={type.employeeId}>
                                    {type.employeeName}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField select label="Shift" name="shiftId" value={selectedEmployee.shiftId} onChange={handleChange} fullWidth >
                            {shift.map((type) => (
                                <MenuItem key={type.shiftId} value={type.shiftId}>
                                    {type.shiftName}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField label="Date From" name="dateFrom" type="date" value={selectedEmployee.dateFrom?.split('T')[0]} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
                        <TextField label="Date To" name="dateTo" type="date" value={selectedEmployee.dateTo?.split('T')[0]} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
                        <TextField label="Mobile Number" name="mobileNo" value={selectedEmployee.mobileNo} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>Save</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>View Employee</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField label="Employee Name" value={selectedEmployee.employeeName} fullWidth disabled />
                        <TextField label="Shift" value={selectedEmployee.shiftName} fullWidth disabled />
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