// src/pages/Master/EmployeeMasterPage.jsx

import React, { useEffect, useState } from 'react';
import {
    Container, Typography, Button, TextField, Dialog,
    DialogTitle, DialogContent, DialogActions, Box,
    IconButton, Tooltip, Table, TableHead, TableRow,
    TableCell, TableBody, Stack
} from '@mui/material';
import {
    getAllEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee
} from "../../Services/EmployeeService";
import AlertSnackbar from "../../Components/Alert/AlertSnackBar";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useSelector } from "react-redux";

const EmployeeMasterPage = () => {
    const officeId = useSelector((state) => state.user.officeId);
    const [employees, setEmployees] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

    const [selectedEmployee, setSelectedEmployee] = useState({
        employeeId:'',
        employeeName: '',
        email: '',
        phoneNumber: '',
        designation: '',
        roleId: 10,
        department:'',
        officeId: '',
        employeeCode: '',
        Image: ''
    });

    const [alert, setAlert] = useState({ open: false, type: 'success', message: '' });

    useEffect(() => {
        if (officeId) {
            loadEmployees();
        }
    }, [officeId]);

    const loadEmployees = async () => {
        try {
            console.log(officeId)
            const data = await getAllEmployees(officeId);
            setEmployees(data);
        } catch {
            showAlert('error', 'Failed to load employee list');
        }
    };

    const showAlert = (type, message) => {
        setAlert({ open: true, type, message });
    };

    const handleCreate = () => {
        setIsEdit(false);
        setSelectedEmployee({
            employeeName: '',
            email: '',
            phoneNumber: '',
            designation: '',
            roleId: 9,
            department: '',
            officeId: officeId || '',
            employeeCode: ''
        });
        setDialogOpen(true);
    };

    const handleEdit = (emp) => {
        setSelectedEmployee({ ...emp });
        setIsEdit(true);
        setDialogOpen(true);
    };

    const handleView = (emp) => {
        setSelectedEmployee({ ...emp });
        setViewOpen(true);
    };

    const handleDelete = async (emp) => {
        if (window.confirm(`Are you sure you want to delete "${emp.employeeName}"?`)) {
            try {
                await deleteEmployee(emp.employeeId);
                showAlert('success', 'Employee deleted successfully');
                loadEmployees();
            } catch {
                showAlert('error', 'Failed to delete employee');
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSelectedEmployee({ ...selectedEmployee, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedEmployee({ ...selectedEmployee, profileImageUrl: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        const payload = {
            ...selectedEmployee,
            officeId: parseInt(officeId),
            roleId: parseInt(selectedEmployee.roleId || 0),
            createdBy: 1,
            isActive: true
        };

        try {
            if (isEdit) {
                await updateEmployee(selectedEmployee.employeeId, payload);
                showAlert('success', 'Employee updated successfully');
            } else {
                await createEmployee(payload);
                showAlert('success', 'Employee created successfully');
            }
            setDialogOpen(false);
            loadEmployees();
        } catch {
            showAlert('error', 'Failed to save employee');
        }
    };

    return (
        <Container maxWidth={false}>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h4">Employee Master</Typography>
                <Button variant="contained" onClick={handleCreate}>Add Employee</Button>
            </Box>

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Employee Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Phone</TableCell>
                        <TableCell>Designation</TableCell>
                        <TableCell align="center">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {employees.length > 0 ? (
                        employees.map((emp, index) => (
                            <TableRow key={emp.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{emp.employeeName}</TableCell>
                                <TableCell>{emp.email}</TableCell>
                                <TableCell>{emp.phoneNumber}</TableCell>
                                <TableCell>{emp.designation}</TableCell>
                                <TableCell align="center">
                                    <Tooltip title="View">
                                        <IconButton onClick={() => handleView(emp)} color="info">
                                            <VisibilityIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Edit">
                                        <IconButton onClick={() => handleEdit(emp)} color="primary">
                                            <EditIcon />
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
                            <TableCell colSpan={6} align="center">No employees found</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>{isEdit ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField label="Employee Name" name="employeeName" value={selectedEmployee.employeeName} onChange={handleChange} fullWidth />
                        <TextField label="Email" name="email" value={selectedEmployee.email} onChange={handleChange} fullWidth />
                        <TextField label="Phone Number" name="phoneNumber" value={selectedEmployee.phoneNumber} onChange={handleChange} fullWidth />
                        <TextField label="Designation" name="designation" value={selectedEmployee.designation} onChange={handleChange} fullWidth />
                        <TextField label="Department" name="department" value={selectedEmployee.department} onChange={handleChange} fullWidth />
                        <TextField label="Employee Code" name="employeeCode" value={selectedEmployee.employeeCode} onChange={handleChange} fullWidth />
                        <TextField type="file" name="image" onChange={handleFileChange} fullWidth InputLabelProps={{ shrink: true }} />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>{isEdit ? 'Update' : 'Save'}</Button>
                </DialogActions>
            </Dialog>

            {/* View Dialog */}
            <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>View Employee</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField label="Employee Name" value={selectedEmployee.employeeName} fullWidth disabled />
                        <TextField label="Email" value={selectedEmployee.email} fullWidth disabled />
                        <TextField label="Phone Number" value={selectedEmployee.phoneNumber} fullWidth disabled />
                        <TextField label="Designation" value={selectedEmployee.designation} fullWidth disabled />
                        <TextField label="Department" value={selectedEmployee.department} fullWidth disabled />
                        <TextField label="Office ID" value={selectedEmployee.officeId} fullWidth disabled />
                        <TextField label="Employee Code" value={selectedEmployee.employeeCode} fullWidth disabled />
                        <TextField label="Image" value={selectedEmployee.Image} fullWidth disabled />
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

export default EmployeeMasterPage;
