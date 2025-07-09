import React, { useEffect, useState } from 'react';
import {
    Container, Typography, Button, TextField, Dialog,
    DialogTitle, DialogContent, DialogActions, Box,
    IconButton, Tooltip, Table, TableHead, TableRow,
    TableCell, TableBody, Stack
} from '@mui/material';
import { getAllOffices, createOffice, updateOffice, deleteOffice } from "../../Services/OfficeService";
import AlertSnackbar from "../../Components/Alert/AlertSnackBar";

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

const OfficeMasterPage = () => {
    const [offices, setOffices] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedOffice, setSelectedOffice] = useState({
        officeName: '',
        city: '',
        state: '',
        latitude: '',
        longitude: '',
        email: '',
        region: '',
        pincode: '',
        officeType: '',
        addressLine1: '',
        addressLine2: '',
        contactNumber: '',
    });

    const [alert, setAlert] = useState({ open: false, type: 'success', message: '' });

    useEffect(() => {
        loadOffices();
    }, []);

    const loadOffices = async () => {
        try {
            const data = await getAllOffices();
            setOffices(data);
        } catch {
            showAlert('error', 'Failed to load office list');
        }
    };

    const showAlert = (type, message) => {
        setAlert({ open: true, type, message });
    };

    const handleCreate = () => {
        setIsEdit(false);
        setSelectedOffice({ officeName: '', city: '', state: '', latitude: '', longitude: '' });
        setDialogOpen(true);
    };

    const handleEdit = (office) => {
        setSelectedOffice(office);
        setIsEdit(true);
        setDialogOpen(true);
    };

    const handleView = (office) => {
        setSelectedOffice(office);
        setViewOpen(true);
    };

    const handleDelete = async (office) => {
        if (window.confirm(`Are you sure you want to delete "${office.officeName}"?`)) {
            try {
                await deleteOffice(office.officeId);
                showAlert('success', 'Office deleted successfully');
                loadOffices();
            } catch {
                showAlert('error', 'Failed to delete office');
            }
        }
    };

    const handleChange = (e) => {
        setSelectedOffice({ ...selectedOffice, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            if (isEdit) {
                await updateOffice(selectedOffice.officeId, selectedOffice);
                showAlert('success', 'Office updated successfully');
            } else {
                await createOffice(selectedOffice);
                showAlert('success', 'Office added successfully');
            }
            setDialogOpen(false);
            loadOffices();
        } catch {
            showAlert('error', 'Failed to save office');
        }
    };

    return (
        <Container maxWidth={false}>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h4">Office Master</Typography>
                <Button variant="contained" onClick={handleCreate}>
                    Add Office
                </Button>
            </Box>

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Office Name</TableCell>
                        <TableCell>City</TableCell>
                        <TableCell>State</TableCell>
                        <TableCell>Office Type</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell align="center">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {offices.length > 0 ? (
                        offices.map((office, index) => (
                            <TableRow key={office.officeId}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{office.officeName}</TableCell>
                                <TableCell>{office.city}</TableCell>
                                <TableCell>{office.state}</TableCell>
                                <TableCell>{office.officeType}</TableCell>
                                <TableCell>{office.email}</TableCell>
                                <TableCell align="center">
                                    <Tooltip title="View">
                                        <IconButton onClick={() => handleView(office)} color="info">
                                            <VisibilityIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Edit">
                                        <IconButton onClick={() => handleEdit(office)} color="primary">
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                        <IconButton onClick={() => handleDelete(office)} color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} align="center">No offices found</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>{isEdit ? 'Edit Office' : 'Add Office'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField label="Office Name" name="officeName" value={selectedOffice.officeName} onChange={handleChange} fullWidth />
                        <TextField label="City" name="city" value={selectedOffice.city} onChange={handleChange} fullWidth />
                        <TextField label="State" name="state" value={selectedOffice.state} onChange={handleChange} fullWidth />
                        <TextField label="Latitude" name="latitude" value={selectedOffice.latitude} onChange={handleChange} fullWidth />
                        <TextField label="Longitude" name="longitude" value={selectedOffice.longitude} onChange={handleChange} fullWidth />
                        <TextField fullWidth label="Email" name="email" value={selectedOffice.email} onChange={handleChange} />
                        <TextField fullWidth label="Region" name="region" value={selectedOffice.region} onChange={handleChange} />
                        <TextField fullWidth label="Pincode" name="pincode" value={selectedOffice.pincode} onChange={handleChange} />
                        <TextField fullWidth label="Office Type" name="officeType" value={selectedOffice.officeType} onChange={handleChange} />
                        <TextField fullWidth label="Address Line 1" name="addressLine1" value={selectedOffice.addressLine1} onChange={handleChange} />
                        <TextField fullWidth label="Address Line 2" name="addressLine2" value={selectedOffice.addressLine2} onChange={handleChange} />
                        <TextField fullWidth label="Contact Number" name="contactNumber" value={selectedOffice.contactNumber} onChange={handleChange} />

                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>{isEdit ? 'Update' : 'Save'}</Button>
                </DialogActions>
            </Dialog>

            {/* View Dialog */}
            <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>View Office</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField label="Office Name" value={selectedOffice.officeName} fullWidth disabled />
                        <TextField label="City" value={selectedOffice.city} fullWidth disabled />
                        <TextField label="State" value={selectedOffice.state} fullWidth disabled />
                        <TextField label="Latitude" value={selectedOffice.latitude} fullWidth disabled />
                        <TextField label="Longitude" value={selectedOffice.longitude} fullWidth disabled />
                        <TextField fullWidth label="Email" name="email" value={selectedOffice.email} onChange={handleChange} disabled />
                        <TextField fullWidth label="Region" name="region" value={selectedOffice.region} onChange={handleChange} disabled />
                        <TextField fullWidth label="Pincode" name="pincode" value={selectedOffice.pincode} onChange={handleChange} disabled />
                        <TextField fullWidth label="Office Type" name="officeType" value={selectedOffice.officeType} onChange={handleChange} disabled />
                        <TextField fullWidth label="Address Line 1" name="addressLine1" value={selectedOffice.addressLine1} onChange={handleChange} disabled />
                        <TextField fullWidth label="Address Line 2" name="addressLine2" value={selectedOffice.addressLine2} onChange={handleChange} disabled />
                        <TextField fullWidth label="Contact Number" name="contactNumber" value={selectedOffice.contactNumber} onChange={handleChange} disabled />

                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <AlertSnackbar
                open={alert.open}
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert({ ...alert, open: false })}
            />
        </Container>
    );
};

export default OfficeMasterPage;
