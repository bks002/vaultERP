import React, { useEffect, useState } from 'react';
import {
    Container, Typography, Button, TextField, Dialog,
    DialogTitle, DialogContent, DialogActions, Box,
    IconButton, Tooltip, Table, TableHead, TableRow,
    TableCell, TableBody, Grid, InputAdornment
} from '@mui/material';
import { getAllEmployees } from '../../Services/EmployeeService.js';
import { getAllOperation } from '../../Services/OperationService.js';
import { getAllItems } from '../../Services/InventoryService.jsx';
import { getAllAssets } from '../../Services/AssetService.js';
import AlertSnackbar from "../../Components/Alert/AlertSnackBar.jsx";
import SearchIcon from '@mui/icons-material/Search';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSelector } from "react-redux";
import { getAllShift } from '../../Services/ShiftService.js';
import {
    createPlanning,
    deletePlanning,
    getAllPlanningByOffice,
    updatePlanning
} from "../../Services/PlanningService.js";
import * as XLSX from 'xlsx';
import { getInternalWorkOrdersByOffice } from '../../Services/InternalWorkOrderService.js'; 


const DailyPlanningSheet = () => {
    const officeId = useSelector((state) => state.user.officeId);
    const userId = useSelector((state) => state.user.userId);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);
    const [Employees, setEmployees] = useState([]);
    const [Items, setItems] = useState([]);
    const [Operations, setOperations] = useState([]);
    const [Assets, setAssets] = useState([]);
    const [planningData, setPlanningData] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [selectedShift, setSelectedShift] = useState({
        officeId: 0,
        id: 0,
        internalWorkOrderId: 0,
        planDate: '',
        operationId: 0,
        employeeId: 0,
        assetId: 0,
        shiftId: 0,
        manpower: '',
        target: '',
        achieved: 0,
        backfeed: '',
        remarks: '',
        isActive: true,
        createdBy: userId || 0
    });
    const [alert, setAlert] = useState({ open: false, type: 'success', message: '' });
    const [internalWorkOrders, setInternalWorkOrders] = useState([]);

    useEffect(() => {
        if (officeId) {
            loadPlanningData();
            loadEmployees();
            loadOperations();
            loadItems();
            loadAssets();
            loadShift();
            loadInternalWorkOrders(); 
        }
    }, [officeId]);

      const loadInternalWorkOrders = async () => {
        try {
            const data = await getInternalWorkOrdersByOffice(officeId);
            setInternalWorkOrders(data);
        } catch {
            showAlert('error', 'Failed to load internal work orders');
        }
    };

    const loadPlanningData = async () => {
        try {
            const data = await getAllPlanningByOffice(officeId);
            setPlanningData(data);
        }
        catch {
            showAlert('error', 'Failed to load planning data')
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
            internalWorkOrderId: 0,
            planDate: '',
            operationId: 0,
            employeeId: 0,
            assetId: 0,
            shiftId: 0,
            manpower: '',
            target: '',
            achieved: 0,
            isActive:true,
            backfeed: '',
            remarks: '',
            createdBy: userId || 0
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
        if (!selectedShift.employeeId || !selectedShift.internalWorkOrderId || !selectedShift.assetId || !selectedShift.planDate) {
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
            'Item Name': Items.find(i => i.id === p.internalWorkOrderId)?.name,
            'Shift Name': shifts.find(s => s.shiftId === p.shiftId)?.shiftName,
            'Target': p.target,
            'Backfeed': p.backfeed,
            'Remarks': p.remarks
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Planning Sheet');

        XLSX.writeFile(workbook, 'DailyPlanningSheet.xlsx');
    };
    const filteredPlanningData = planningData.filter((entry) => {
        const employeeName = Employees.find(e => e.employeeId === entry.employeeId)?.employeeName || '';
        const shiftName = shifts.find(s => s.shiftId === entry.shiftId)?.shiftName || '';

        const matchesSearch =
            employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            shiftName.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDate = selectedDate
            ? entry.planDate?.substring(0, 10) === selectedDate.toISOString().substring(0, 10)
            : true;

        return matchesSearch && matchesDate;
    });

    return (
        <Container maxWidth={false}>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h4">Daily Planning Sheet</Typography>
                <Box display="flex" alignItems="center" gap={2}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Select Date"
                            value={selectedDate}
                            onChange={(date) => setSelectedDate(date)}
                            slotProps={{
                                textField: { size: 'small', fullWidth: false },
                            }}
                        />
                    </LocalizationProvider>
                    <TextField
                        placeholder="Search by employee name or shift"
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
                    <Button variant="outlined" size="small" onClick={handleExport}>
                        Export to Excel
                    </Button>
                    <Button variant="contained" size="small" onClick={handleCreate}>
                        Create Planning
                    </Button>
                </Box>
            </Box>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Plan Date</TableCell>
                        <TableCell>Machine Name</TableCell>
                        <TableCell>Operator Name</TableCell>
                        <TableCell>Manpower</TableCell>
                        <TableCell>Item</TableCell>
                        <TableCell>Shift</TableCell>
                        <TableCell align="center">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredPlanningData.length > 0 ? (
                        filteredPlanningData.map((emp, index) => (

                            <TableRow key={emp.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{emp.planDate ? emp.planDate.substring(0, 10) : ''}</TableCell>
                                <TableCell>{Assets.find(a => a.assetId === emp.assetId)?.assetName}</TableCell>
                                <TableCell>{Employees.find(e => e.employeeId === emp.employeeId)?.employeeName}</TableCell>
                                <TableCell>{emp.manpower}</TableCell>
                                <TableCell>{Items.find(i => i.id === emp.internalWorkOrderId)?.name}</TableCell>
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
                <DialogTitle>{isEdit ? 'Edit Shift' : 'Create Daily Planning Sheet'}</DialogTitle>
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
    label="Internal Work ID"
    name="internalWorkOrderId" 
    value={selectedShift.internalWorkOrderId}
    onChange={handleChange}
    fullWidth
    sx={{ mt: 2 }}
    SelectProps={{ native: true }}
>
    <option value=""></option>
    {internalWorkOrders.map((wo) => (
        <option key={wo.id} value={wo.id}>
            {`WO-${wo.woid} | Qty: ${wo.quantity} | Dispatch: ${wo.dispatchDate?.substring(0, 10)}`}
        </option>
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
                                name="remarks"
                                value={selectedShift.remarks}
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