import React, { useEffect, useState } from 'react';
import {
    Container, Typography, Button, TextField, Dialog,
    DialogTitle, DialogContent, DialogActions, Box,
    IconButton, Tooltip, Table, TableHead, TableRow,
    TableCell, TableBody, Grid, InputAdornment,
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
import SearchIcon from '@mui/icons-material/Search';

const DailyPlanningSheet = () => {
    const officeId = useSelector((state) => state.user.officeId);
    const userId = useSelector((state) => state.user.userId);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [Employees, setEmployees] = useState([]);
    const [Items, setItems] = useState([]);
    const [Operations, setOperations] = useState([]);
    const [Assets, setAssets] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
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

    useEffect(() => {
        if (officeId) {
            loadEmployees();
            loadOperations();
            loadItems();
            loadAssets();
            loadShift();
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
        const filteredSheets = shift.filter((v) =>
        v.machineName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.operationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.manpower?.includes(searchQuery) ||
        v.item?.toLowerCase().includes(searchQuery.toLowerCase()) 
 );
    return (
        <Container maxWidth={false}>
           <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h4">Daily Planning Sheet</Typography>
                <Box display="flex" alignItems="center" gap={2}>
                    <TextField
                        placeholder="Search by Machine Name, Operator Name, Manpower, Item"
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
                    <Button variant="contained" color="primary" onClick={handleCreate}>
                        Create Planning
                    </Button>
                </Box>
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
                    {filteredSheets > 0 ? (
                       filteredSheets.map((emp, index) => (
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
                        <Grid item xs={12} md={6}>
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
                                label="Shift"
                                name="shift"
                                value={selectedShift.shift}
                                onChange={handleChange}
                                fullWidth
                                sx={{ mt: 2 }}
                                SelectProps={{ native: true }}
                            >
                                <option value=""></option>
                                {shifts.map((a) => (
                                    <option key={a.shiftId} value={a.shiftName}>{a.shiftName}</option>
                                ))}
                            </TextField>
                           <TextField
                          select
                          label="Machine Name"
                          name="asset"
                         value={selectedShift.asset}
                         onChange={handleChange}
                          fullWidth
                        sx={{ mt: 2 }}
                         SelectProps={{ native: true }}
                        >
                          <option value=""></option>
                          {Assets.filter((a) => a.assetTypeId === 1).map((a) => (
                           <option key={a.assetId} value={a.assetName}>{a.assetName}</option>
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
                                {Operations.map((op) => (
                                    <option key={op.operationId} value={op.operationName}>{op.operationName}</option>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                label="Employee Name"
                                name="EmployeeName"
                                value={selectedShift.EmployeeName}
                                onChange={handleChange}
                                fullWidth
                                SelectProps={{ native: true }}
                            >
                                <option value=""></option>
                                {Employees.map((emp) => (
                                    <option key={emp.employeeId} value={emp.employeeName}>{emp.employeeName}</option>
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
                                {Items.map((i) => (
                                    <option key={i.id} value={i.name}>{i.name}</option>
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
