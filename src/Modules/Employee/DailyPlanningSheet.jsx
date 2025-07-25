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
import {
    createPlanning,
    deletePlanning,
    getAllPlanningByOffice,
    updatePlanning
} from "../../Services/PlanningService.js";
import * as XLSX from 'xlsx';

const DailyPlanningSheet = () => {
    const officeId = useSelector((state) => state.user.officeId);
    const userId = useSelector((state) => state.user.userId);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [Employees, setEmployees] = useState([]);
    const [Items, setItems] = useState([]);
    const [Operations, setOperations] = useState([]);
    const [Assets, setAssets] = useState([]);
    const [planningData, setPlanningData] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [selectedShift, setSelectedShift] = useState({
        officeId:0,
        id: 0,
        itemId: 0,
        planDate: '',
        operationId: 0,
        employeeId: 0,
        assetId: 0,
        shiftId: 0,
        manpower: '',
        target: '',
        achieved: 0,
        backfeed: '',
        remark: '',
        created_by: userId || 0
    });
    const [alert, setAlert] = useState({ open: false, type: 'success', message: '' });

    useEffect(() => {
        if (officeId) {
            loadPlanningData();
            loadEmployees();
            loadOperations();
            loadItems();
            loadAssets();
            loadShift();
        }
    }, [officeId]);

    const loadPlanningData = async()=>{
        try {
            const data = await getAllPlanningByOffice(officeId);
            setPlanningData(data);
        }
        catch {
            showAlert('error','Failed to load planning data')
        }
    }

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
            officeId: officeId,
            id: 0,
            itemId: 0,
            planDate: '',
            operationId: 0,
            employeeId: 0,
            assetId: 0,
            shiftId: 0,
            manpower: '',
            target: '',
            achieved: 0,
            backfeed: '',
            remark: '',
            created_by: userId || 0
        });
        setDialogOpen(true);
    };

    const handleEdit = (entry) => {
        setSelectedShift({ ...entry });
        setIsEdit(true);
        setDialogOpen(true);
    };

    const handleDelete = async (entry) => {
        if (window.confirm(`Are you sure you want to delete this shift?`)) {
            try {
                await deletePlanning(entry.id);
                showAlert('success', 'Shift deleted successfully');
                loadPlanningData(); // reload after delete
            } catch (err) {
                showAlert('error', err.message || 'Failed to delete');
            }
        }
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setSelectedShift((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        console.log(selectedShift)
        if (!selectedShift.employeeId || !selectedShift.itemId || !selectedShift.assetId || !selectedShift.planDate) {
            showAlert('error', 'Please fill required fields');
            return;
        }

        try {
            if (isEdit) {
                await updatePlanning(selectedShift.id, selectedShift);
                showAlert('success', 'Shift updated successfully');
            } else {
                await createPlanning(selectedShift);
                showAlert('success', 'Shift added successfully');
            }
            loadPlanningData(); // reload after save
            setDialogOpen(false);
        } catch (err) {
            showAlert('error', err.message || 'Error occurred');
        }
    };
    const handleExport = () => {
        if (!planningData || planningData.length === 0) {
            showAlert('error', 'No data to export');
            return;
        }

        const exportData = planningData.map((p, index) => ({
            '#': index + 1,
            'Plan Date': p.planDate ? `${p.planDate.substring(0, 10)}` : '',
            'Machine Name': Assets.find(a => a.assetId === p.assetId)?.assetName,
            'Operator Name': Employees.find(e => e.employeeId === p.employeeId)?.employeeName,
            'Manpower': p.manpower,
            'Item Name': Items.find(i => i.id === p.itemId)?.name,
            'Shift Name': shifts.find(s => s.shiftId === p.shiftId)?.shiftName,
            'Target': p.target,
            'Backfeed': p.backfeed,
            'Remarks': p.remark
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Planning Sheet');

        XLSX.writeFile(workbook, 'DailyPlanningSheet.xlsx');
    };

    return (
        <Container maxWidth={false}>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h4">Daily Planning Sheet</Typography>
                <Box>
                    <Button variant="outlined" onClick={handleExport} sx={{ mr: 1 }}>
                        Export to Excel
                    </Button>
                    <Button variant="contained" onClick={handleCreate}>
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
                    {planningData.length > 0 ? (
                        planningData.map((emp, index) => (
                            <TableRow key={emp.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{Assets.find(a => a.assetId === emp.assetId)?.assetName}</TableCell>
                                <TableCell>{Employees.find(e => e.employeeId === emp.employeeId)?.employeeName}</TableCell>
                                <TableCell>{emp.manpower}</TableCell>
                                <TableCell>{Items.find(i => i.id === emp.itemId)?.name}</TableCell>
                                <TableCell>{shifts.find(s => s.shiftId === emp.shiftId)?.shiftName}</TableCell>
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
                                label="Plan Date"
                                name="planDate"
                                type="date"
                                value={selectedShift.planDate ? selectedShift.planDate.substring(0, 10) : ''}
                                onChange={handleChange}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                select
                                label="Shift"
                                name="shiftId"
                                value={selectedShift.shiftId}
                                onChange={handleChange}
                                fullWidth
                                sx={{ mt: 2 }}
                                SelectProps={{ native: true }}
                            >
                                <option value=""></option>
                                {shifts.map((a) => (
                                    <option key={a.shiftId} value={a.shiftId}>{a.shiftName}</option>
                                ))}
                            </TextField>
                            <TextField
                                select
                                label="Machine Name"
                                name="assetId"
                                value={selectedShift.assetId}
                                onChange={handleChange}
                                fullWidth
                                sx={{ mt: 2 }}
                                SelectProps={{ native: true }}
                            >
                                <option value=""></option>
                                {Assets.map((a) => (
                                    <option key={a.assetId} value={a.assetId}>{a.assetName}</option>
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
                                name="operationId"
                                value={selectedShift.operationId}
                                onChange={handleChange}
                                fullWidth
                                sx={{ mt: 2 }}
                                SelectProps={{ native: true }}
                            >
                                <option value=""></option>
                                {Operations.map((op) => (
                                    <option key={op.operationId} value={op.operationId}>{op.operationName}</option>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                label="Employee Name"
                                name="employeeId"
                                value={selectedShift.employeeId}
                                onChange={handleChange}
                                fullWidth
                                SelectProps={{ native: true }}
                            >
                                <option value=""></option>
                                {Employees.map((emp) => (
                                    <option key={emp.employeeId} value={emp.employeeId}>{emp.employeeName}</option>
                                ))}
                            </TextField>
                            <TextField
                                select
                                label="Item Name"
                                name="itemId"
                                value={selectedShift.itemId}
                                onChange={handleChange}
                                fullWidth
                                sx={{ mt: 2 }}
                                SelectProps={{ native: true }}
                            >
                                <option value=""></option>
                                {Items.map((i) => (
                                    <option key={i.id} value={i.id}>{i.name}</option>
                                ))}
                            </TextField>
                            <TextField
                                fullWidth
                                label="Target (KM)"
                                name="target"
                                value={selectedShift.target}
                                onChange={handleChange}
                                sx={{ mt: 2 }}
                            />
                            <TextField
                                fullWidth
                                label="Back Feed (KM)"
                                name="backfeed"
                                value={selectedShift.backfeed}
                                onChange={handleChange}
                                sx={{ mt: 2 }}
                            />
                            <TextField
                                fullWidth
                                label="Remarks"
                                name="remark"
                                value={selectedShift.remark}
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