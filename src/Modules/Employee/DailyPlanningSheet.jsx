import React, { useEffect, useState } from 'react';
import {
    Container, Typography, Button, TextField, Dialog,
    DialogTitle, DialogContent, DialogActions, Box,
    IconButton, Tooltip, Table, TableHead, TableRow,
    TableCell, TableBody, Grid
} from '@mui/material';
import { getAllEmployees } from '../../Services/EmployeeService.js';
import { getAllOperation } from '../../Services/OperationService.js';
import { getAllItems } from '../../Services/InventoryService.jsx';
import { getAllAssets } from '../../Services/AssetService.js';
import AlertSnackbar from "../../Components/Alert/AlertSnackBar.jsx";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useSelector } from "react-redux";
import { getAllShift } from '../../Services/ShiftService.js';

const DailyPlanningSheet = () => {
    const officeId = useSelector((state) => state.user.officeId);
    const userId = useSelector((state) => state.user.userId);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [Employees, setEmployees] = useState([]);
    const [Items, setItems] = useState([]);
    const [Operations, setOperations] = useState([]);
    const [Assets, setAssets] = useState([]);
    const [shift, setShift] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [selectedShift, setSelectedShift] = useState({
        id: null,
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

    // 1. Define a configuration for form fields at the top of the component
    const formFields = [
        {
            label: 'Shift Date',
            name: 'Date',
            type: 'date',
            required: true,
            grid: { xs: 12, md: 6 },
        },
        {
            label: 'Shift',
            name: 'shift',
            type: 'select',
            optionsKey: 'shifts',
            optionLabel: 'shiftName',
            optionValue: 'shiftName',
            required: true,
            grid: { xs: 12, md: 6 },
        },
        {
            label: 'Machine Name',
            name: 'asset',
            type: 'select',
            optionsKey: 'Assets',
            optionLabel: 'assetName',
            optionValue: 'assetName',
            required: true,
            grid: { xs: 12, md: 6 },
        },
        {
            label: 'Manpower',
            name: 'manpower',
            type: 'text',
            grid: { xs: 12, md: 6 },
        },
        {
            label: 'Operation Name',
            name: 'operationName',
            type: 'select',
            optionsKey: 'Operations',
            optionLabel: 'operationName',
            optionValue: 'operationName',
            grid: { xs: 12, md: 6 },
        },
        {
            label: 'Employee Name',
            name: 'EmployeeName',
            type: 'select',
            optionsKey: 'Employees',
            optionLabel: 'employeeName',
            optionValue: 'employeeName',
            required: true,
            grid: { xs: 12, md: 6 },
        },
        {
            label: 'Item Name',
            name: 'Item',
            type: 'select',
            optionsKey: 'Items',
            optionLabel: 'name',
            optionValue: 'name',
            required: true,
            grid: { xs: 12, md: 6 },
        },
        {
            label: 'Target',
            name: 'target',
            type: 'text',
            grid: { xs: 12, md: 6 },
        },
        {
            label: 'Back Feed',
            name: 'backfeed',
            type: 'text',
            grid: { xs: 12, md: 6 },
        },
    ];

    useEffect(() => {
        if (officeId) {
            Promise.all([
                getAllEmployees(officeId),
                getAllOperation(officeId),
                getAllItems(officeId),
                getAllAssets(officeId),
                getAllShift(officeId),
            ]).then(([employees, operations, items, assets, shifts]) => {
                setEmployees(employees);
                setOperations(operations);
                setItems(items);
                setAssets(assets);
                setShifts(shifts);
            }).catch((err) => {
                showAlert('error', 'Failed to load dropdown data');
            });
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

    const loadShift = async () => {
        try {
            const data = await getAllShift(officeId);
            setShifts(data);
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

    const loadItems = async () => {
        try {
            const data = await getAllItems(officeId);
            setItems(data);
        } catch {
            showAlert('error', 'Failed to load items');
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
            id: null,
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

    const handleEdit = (entry) => {
        setSelectedShift({ ...entry });
        setIsEdit(true);
        setDialogOpen(true);
    };

    const handleDelete = (entry) => {
        if (window.confirm(`Are you sure you want to delete "${entry.EmployeeName}" shift?`)) {
            setShift(prev => prev.filter(p => p.id !== entry.id));
            showAlert('success', 'Shift deleted successfully');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSelectedShift(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        const newEntry = {
            ...selectedShift,
            id: selectedShift.id || Date.now(), // use existing ID or assign new one
        };

        if (!selectedShift.EmployeeName || !selectedShift.Item || !selectedShift.asset || !selectedShift.Date) {
            showAlert('error', 'Please fill required fields');
            return;
        }

        if (isEdit) {
            setShift(prev =>
                prev.map(entry =>
                    entry.id === newEntry.id ? newEntry : entry
                )
            );
            showAlert('success', 'Shift updated successfully');
        } else {
            setShift(prev => [...prev, newEntry]);
            showAlert('success', 'Shift added successfully');
        }

        setDialogOpen(false);
    };

    return (
        <Container maxWidth={false}>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h4">Daily Planning Sheet</Typography>
                <Button variant="contained" onClick={handleCreate}>Create Planning</Button>
            </Box>

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Machine Name</TableCell>
                        <TableCell>Operator Name</TableCell>
                        <TableCell>Manpower</TableCell>
                        <TableCell>Item</TableCell>
                        <TableCell>Shift</TableCell>
                        <TableCell align="center">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {shift.length > 0 ? (
                        shift.map((emp, index) => (
                            <TableRow key={emp.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{emp.asset}</TableCell>
                                <TableCell>{emp.EmployeeName}</TableCell>
                                <TableCell>{emp.manpower}</TableCell>
                                <TableCell>{emp.Item}</TableCell>
                                <TableCell>{emp.shift}</TableCell>
                                <TableCell align="center">
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
                            <TableCell colSpan={7} align="center">No Planning found</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>{isEdit ? 'Edit Shift' : 'Add Shift'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        {formFields.map((field) => (
                            <Grid item key={field.name} xs={field.grid.xs} md={field.grid.md}>
                                {field.type === 'select' ? (
                                    <TextField
                                        select
                                        label={field.label}
                                        name={field.name}
                                        value={selectedShift[field.name] || ''}
                                        onChange={handleChange}
                                        fullWidth
                                        sx={{ mt: 2 }}
                                        SelectProps={{ native: true }}
                                    >
                                        <option value=""></option>
                                        {(field.optionsKey ? (eval(field.optionsKey) || []) : []).map((option) => (
                                            <option
                                                key={option[field.optionValue] || option.id}
                                                value={option[field.optionValue]}
                                            >
                                                {option[field.optionLabel]}
                                            </option>
                                        ))}
                                    </TextField>
                                ) : (
                                    <TextField
                                        label={field.label}
                                        name={field.name}
                                        type={field.type}
                                        value={selectedShift[field.name] || ''}
                                        onChange={handleChange}
                                        fullWidth
                                        sx={{ mt: 2 }}
                                        InputLabelProps={field.type === 'date' ? { shrink: true } : undefined}
                                    />
                                )}
                            </Grid>
                        ))}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>{isEdit ? 'Update' : 'Save'}</Button>
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

export default DailyPlanningSheet;
