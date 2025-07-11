import React, { useEffect, useState } from 'react';
import {
    Container, Typography, Button, TextField, Dialog,
    DialogTitle, DialogContent, DialogActions, Box,
    IconButton, Tooltip, Table, TableHead, TableRow,
    TableCell, TableBody, Grid
} from '@mui/material';
import { getAllEmployees } from '../../Services/EmployeeService';
import { getAllOperation } from '../../Services/OperationService';
import { getAllItems } from '../../Services/InventoryService';
import { getAllShift } from '../../Services/ShiftService';
import { getAllAssets } from '../../Services/AssetService';
import AlertSnackbar from "../../Components/Alert/AlertSnackBar";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useSelector } from "react-redux";

const ShiftMasterPage = () => {
    const officeId = useSelector((state) => state.user.officeId);
    const userId = useSelector((state) => state.user.userId);
    const [dialogOpen, setDialogOpen] = useState(false);
    // const [viewOpen, setViewOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [Employees, setEmployees] = useState([]);
    const [Items, setItems] = useState([]);
    const [Operations, setOperations] = useState([]);
    const [Assets, setAssets]= useState([]);
    const [shift, setShift] = useState([]);
    const [selectedShift, setSelectedShift] = useState({
        Item: '',
        Date: '',
        operationName: '',
        EmployeeName: '',
        process: '',
        asset: '',
        shift: '',
        manpower: '',
        target: '',
        achieved: '',
        backfeed: '',
        remark: '',
    });

    const [alert, setAlert] = useState({ open: false, type: 'success', message: '' });

    useEffect(() => {
        if (officeId) {
            loadEmployees();
            loadOperations();
            loadItems();
            loadShift();
            loadAssets();
        }
    }, [officeId]);

    const loadEmployees = async () => {
        try {
            const data = await getAllEmployees(officeId);
            setEmployees(data);
        } catch {
            showAlert('error', 'Failed to load employee list');
        }
    };

    const loadAssets = async () => {
        try {
            const data = await getAllAssets(officeId);
            setAssets(data);
        } catch {
            showAlert('error', 'Failed to load assets');
        }
    };

    const loadShift = async () => {
        try {
            const data = await getAllShift(officeId);
            setShift(data);
        } catch {
            showAlert('error', 'Failed to load shifts');
        }
    };

    const loadItems = async () => {
        try {
            const data = await getAllItems(officeId);
            setItems(data);
        } catch {
            showAlert('error', 'Failed to load Items');
        }
    };

    const loadOperations = async () => {
        try {
            const data = await getAllOperation(officeId);
            setOperations(data);
        } catch {
            showAlert('error', 'Failed to load operations');
        }
    };

    const showAlert = (type, message) => {
        setAlert({ open: true, type, message });
    };

    const handleCreate = () => {
        setIsEdit(false);
        setSelectedShift({
            Item: '',
            Date: '',
            operationName: '',
            EmployeeName: '',
            process: '',
            asset: '',
            shift: '',
            manpower: '',
            target: '',
            achieved: '',
            backfeed: '',
            remark: '',
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
        setSelectedShift({ ...selectedShift, [name]: value });
    };

    const handleSave = async () => {
        const payload = {
            ...selectedShift,
            officeId: parseInt(officeId),
            createdBy: userId,
            isActive: true
        };

        try {
            if (isEdit) {
                // await updateEmployee(selectedShift.employeeId, payload);
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
                <Typography variant="h4">Shift Master</Typography>
                <Button variant="contained" onClick={handleCreate}>Add Shift</Button>
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
                    {selectedShift.length > 0 ? (
                        selectedShift.map((emp, index) => (
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
                            <TableCell colSpan={6} align="center">No shift found</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>{isEdit ? 'Edit Shift' : 'Add Shift'}</DialogTitle>
                <DialogContent>
                        <Grid container spacing={2} sx={{ mt: 2 }}>
                            <Grid item xs={12} md={6} size={6}>
                                <TextField
                                    label="Shift Date"
                                    name="Date"
                                    type="date"
                                    value={selectedShift.Date}
                                    onChange={handleChange}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                                <TextField
                                    select
                                    label="Asset Name"
                                    name="asset"
                                    value={selectedShift.asset}
                                    onChange={handleChange}
                                    fullWidth
                                    sx={{ mt: 2 }}
                                    SelectProps={{ native: true }}
                                >
                                    <option value=""></option>
                                    {Assets.map((shift) => (
                                        <option key={shift.assetId} value={shift.assetName}>
                                            {shift.assetName}
                                        </option>
                                    ))}
                                </TextField>
                                <TextField
                                    fullWidth
                                    label="Manpower"
                                    name="manpower"
                                    value={selectedShift.manpower}
                                    onChange={handleChange}
                                    sx={{ mt: 2 }}
                                />
                                <TextField
                                    select
                                    label="Operation Name"
                                    name="operationName"
                                    value={selectedShift.operationName}
                                    onChange={handleChange}
                                    fullWidth
                                    sx={{ mt: 2 }}
                                    SelectProps={{ native: true }}
                                >
                                    <option value=""></option>
                                    {Operations.map((shift) => (
                                        <option key={shift.operationId} value={shift.operationName}>
                                            {shift.operationName}
                                        </option>
                                    ))}
                                </TextField>
                                <TextField
                                    fullWidth
                                    label="Achieved"
                                    name="achieved"
                                    value={selectedShift.achieved}
                                    onChange={handleChange}
                                    sx={{ mt: 2 }}
                                />
                                <TextField
                                    fullWidth
                                    label="Remark"
                                    name="remark"
                                    value={selectedShift.remark}
                                    onChange={handleChange}
                                    sx={{ mt: 2 }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6} size={6}>
                                <TextField
                                    select
                                    label="Shift Name"
                                    name="shift"
                                    value={selectedShift.shift}
                                    onChange={handleChange}
                                    fullWidth
                                    SelectProps={{ native: true }}
                                >
                                    <option value=""></option>
                                    {shift.map((shift) => (
                                        <option key={shift.shiftId} value={shift.shiftName}>
                                            {shift.shiftName}
                                        </option>
                                    ))}
                                </TextField>
                                <TextField
                                    select
                                    label="Employee Name"
                                    name="EmployeeName"
                                    value={selectedShift.EmployeeName}
                                    onChange={handleChange}
                                    fullWidth
                                    sx={{ mt: 2 }}
                                    SelectProps={{ native: true }}
                                >
                                    <option value=""></option>
                                    {Employees.map((shift) => (
                                        <option key={shift.employeeId} value={shift.employeeName}>
                                            {shift.employeeName}
                                        </option>
                                    ))}
                                </TextField>
                                <TextField
                                    select
                                    label="Item Name"
                                    name="Item"
                                    value={selectedShift.Item}
                                    onChange={handleChange}
                                    fullWidth
                                    sx={{ mt: 2 }}
                                    SelectProps={{ native: true }}
                                >
                                    <option value=""></option>
                                    {Items.map((shift) => (
                                        <option key={shift.id} value={shift.name}>
                                            {shift.name}
                                        </option>
                                    ))}
                                </TextField>
                                <TextField
                                    fullWidth
                                    label="Target"
                                    name="target"
                                    value={selectedShift.target}
                                    onChange={handleChange}
                                    sx={{ mt: 2 }}
                                />
                                <TextField
                                    fullWidth
                                    label="Back Feed"
                                    name="backfeed"
                                    value={selectedShift.backfeed}
                                    onChange={handleChange}
                                    sx={{ mt: 2 }}
                                />
                            </Grid>
                        </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>{isEdit ? 'Update' : 'Save'}</Button>
                </DialogActions>
            </Dialog>

            {/* View Dialog */}
            {/* <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="sm">
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
            </Dialog> */}

            <AlertSnackbar
                open={alert.open}
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert({ ...alert, open: false })}
            />
        </Container>
    );
};

export default ShiftMasterPage;
