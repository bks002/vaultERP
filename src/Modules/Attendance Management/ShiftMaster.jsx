import React, { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { useSelector } from "react-redux";
import {
    Container, Typography, Grid, TextField, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, InputAdornment, IconButton, Tooltip, Stack, Paper, Checkbox
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AlertSnackbar from "../../Components/Alert/AlertSnackBar";
import { createShift, deleteShift, EditShift, getAllShift } from "../../Services/ShiftService";
import ExportCSVButton from '../../Components/Export to CSV/ExportCSVButton';

const ShiftMaster = () => {
    const officeId = useSelector((state) => state.user.officeId);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [shift, setShift] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [alert, setAlert] = useState({ open: false, type: 'success', message: '' });
    const [viewOpen, setViewOpen] = useState(false);

    const defaultFormData = {
        shiftId: "",
        shiftName: "",
        shiftCode: "",
        startTime: "",
        endTime: "",
    };

    const [formData, setFormData] = useState(defaultFormData);

    const showAlert = (type, message) => {
        setAlert({ open: true, type, message });
    };

    useEffect(() => {
        if (officeId) {
            loadAllShift();
        }
    }, [officeId]);

    const loadAllShift = async () => {
        try {
            setLoading(true);
            const data = await getAllShift(officeId);
            setShift(data);
        } catch {
            showAlert('error', 'Failed to load Shift');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSave = async () => {
        const dtoPayload = {
            ...formData,
            shiftId: formData.shiftId ? parseInt(formData.shiftId) : 0,
            startTime: formData.startTime,
            endTime: formData.endTime,
            officeId: parseInt(officeId),
        };

        const payload = dtoPayload;

        try {
            if (isEdit) {
                await EditShift(payload, dtoPayload.shiftId);
                showAlert('success', 'Shift updated successfully');
            } else {
                await createShift(payload);
                showAlert('success', 'Shift created successfully');
            }

            setDialogOpen(false);
            loadAllShift();
        } catch {
            showAlert('error', 'Failed to save shift');
        }
    };


    const handleEdit = (shift) => {
        setIsEdit(true)
        setFormData(shift);
        setDialogOpen(true);
    };

    const handleCreate = () => {
        setIsEdit(false);
        setFormData({
            shiftId: "",
            shiftName: "",
            shiftCode: "",
            startTime: "",
            endTime: "",
        });
        setDialogOpen(true);
    };

    const handleView = (shift) => {
        setFormData(shift);
        setViewOpen(true);
    };

    const handleDelete = async (shift) => {
        try {
            await deleteShift(shift.shiftId);
            showAlert('success', 'shift deleted successfully');
            loadAllShift();
        } catch {
            showAlert('error', 'Failed to delete shift');
        }
    };
    const filteredShift = shift.filter((v) =>
        v.shiftName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.shiftCode?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const csvHeaders = [
        { label: 'Shift Name', key: 'shiftName' },
        { label: 'Shift Code', key: 'shiftCode' },
        { label: 'Start Time', key: 'startTime' },
        { label: 'End Time', key: 'endTime' },
    ];
    return (
        <Container maxWidth={false}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h4">Shift Master</Typography>
                <Box display="flex" alignItems="center" gap={2}>
                    <TextField
                        placeholder="Search by Shift Name, Shift Code"
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
                        data={filteredShift}
                        filename="Shifts.csv"
                        headers={csvHeaders}
                    />
                    <Button variant="contained" color="primary" onClick={handleCreate}>
                        Add Shift
                    </Button>
                </Box>
            </Box>

            {/* Table */}
            {loading ? (
                <Typography>Loading data...</Typography>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>Shift Name</TableCell>
                                <TableCell>Shift Code</TableCell>
                                <TableCell>Start Time</TableCell>
                                <TableCell>End Time</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredShift.length > 0 ? (
                                filteredShift.map((shift, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{shift.shiftName}</TableCell>
                                        <TableCell>{shift.shiftCode}</TableCell>
                                        <TableCell>{shift.startTime}</TableCell>
                                        <TableCell>{shift.endTime}</TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="View"><IconButton onClick={() => handleView(shift)} color="info"><VisibilityIcon /></IconButton></Tooltip>
                                            <Tooltip title="Edit"><IconButton onClick={() => handleEdit(shift)} color="primary"><EditIcon /></IconButton></Tooltip>
                                            <Tooltip title="Delete"><IconButton onClick={() => handleDelete(shift)} color="error"><DeleteIcon /></IconButton></Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={4} align="center">No shift records found.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>{isEdit ? "Edit Shift" : "Add New Shift"}</DialogTitle>
                <DialogContent>
                    <Grid spacing={2} mt={1}>
                        <Grid xs={6} md={2}>
                            <TextField fullWidth label="Shift Name" name="shiftName" value={formData.shiftName} onChange={handleChange} />
                            <TextField fullWidth label="Shift Code" name="shiftCode" value={formData.shiftCode} onChange={handleChange} sx={{ mt: 2 }} />
                            <TextField fullWidth label="Start Time" name="startTime" type="time" InputLabelProps={{ shrink: true }} inputProps={{ step: 1 }} value={formData.startTime || ""} onChange={handleChange} sx={{ mt: 2 }} />
                            <TextField fullWidth label="End Time" name="endTime" type="time" InputLabelProps={{ shrink: true }} inputProps={{ step: 1 }} value={formData.endTime || ""} onChange={handleChange} sx={{ mt: 2 }} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)} color="secondary">Cancel</Button>
                    <Button onClick={handleSave} variant="contained" color="primary">Save</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>View Shift</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField fullWidth label="Shift Name" value={formData.shiftName} disabled />
                        <TextField fullWidth label="Shift Code" value={formData.shiftCode} disabled />
                        <TextField fullWidth label="Start Time" value={formData.startTime} disabled />
                        <TextField fullWidth label="End Time" value={formData.endTime} disabled />
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

export default ShiftMaster;
