import React, { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TableContainer,
    IconButton,
    Paper,
    Typography,
    Tooltip,
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Stack,
    Switch,
    FormControlLabel,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
    getVendors,
    deleteVendor,
    createVendor,
    updateVendor,
} from '../../Services/InventoryService.jsx';
import { useSelector } from 'react-redux';

const Vendor = () => {
    const officeId = useSelector((state) => state.user.officeId);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState({
        name: '',
        contactPerson: '',
        contactNumber: '',
        email: '',
        address: '',
        gstNumber: '',
        panNumber: '',
        websiteUrl: '',
        isActive: true,
    });
    const [isEdit, setIsEdit] = useState(false);

    const loadVendors = async () => {
        try {
            setLoading(true);
            const data = await getVendors(officeId);
            setVendors(data);
        } catch (error) {
            console.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (officeId > 0) loadVendors();
    }, [officeId]);

    const handleEdit = (vendor) => {
        setSelectedVendor(vendor);
        setIsEdit(true);
        setDialogOpen(true);
    };

    const handleDelete = async (vendor) => {
        if (window.confirm(`Are you sure you want to delete "${vendor.name}"?`)) {
            try {
                await deleteVendor(vendor.id);
                alert('Vendor deleted successfully!');
                loadVendors();
            } catch (error) {
                alert(error.message);
            }
        }
    };

    const handleCreateNew = () => {
        setSelectedVendor({
            name: '', contactPerson: '', contactNumber: '', email: '', address: '', gstNumber: '', panNumber: '', websiteUrl: '', isActive: true,
        });
        setIsEdit(false);
        setDialogOpen(true);
    };

    const handleSave = async () => {
        try {
            if (isEdit) {
                await updateVendor(selectedVendor.id, selectedVendor);
                alert('Vendor updated successfully!');
            } else {
                await createVendor({ ...selectedVendor, officeId, createdBy: 1 });
                alert('Vendor created successfully!');
            }
            setDialogOpen(false);
            loadVendors();
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="col-12">
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h4">Vendor Master</Typography>
                <Button variant="contained" color="primary" onClick={handleCreateNew}>
                    Create New Vendor
                </Button>
            </Box>

            {loading && <Typography>Loading data...</Typography>}

            {!loading && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Contact Person</TableCell>
                                <TableCell>Contact Number</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {vendors.length > 0 ? (
                                vendors.map((vendor, index) => (
                                    <TableRow key={vendor.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{vendor.name}</TableCell>
                                        <TableCell>{vendor.contactPerson}</TableCell>
                                        <TableCell>{vendor.contactNumber}</TableCell>
                                        <TableCell>{vendor.email}</TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Edit">
                                                <IconButton color="primary" onClick={() => handleEdit(vendor)}>
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton color="error" onClick={() => handleDelete(vendor)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        No vendors found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>{isEdit ? 'Edit Vendor' : 'Create New Vendor'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField
                            label="Name"
                            value={selectedVendor.name}
                            onChange={(e) => setSelectedVendor({ ...selectedVendor, name: e.target.value })}
                            required
                            fullWidth
                        />
                        <TextField
                            label="Contact Person"
                            value={selectedVendor.contactPerson}
                            onChange={(e) => setSelectedVendor({ ...selectedVendor, contactPerson: e.target.value })}
                            required
                            fullWidth
                        />
                        <TextField
                            label="Contact Number"
                            value={selectedVendor.contactNumber}
                            onChange={(e) => setSelectedVendor({ ...selectedVendor, contactNumber: e.target.value })}
                            required
                            fullWidth
                        />
                        <TextField
                            label="Email"
                            value={selectedVendor.email}
                            onChange={(e) => setSelectedVendor({ ...selectedVendor, email: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Address"
                            value={selectedVendor.address}
                            onChange={(e) => setSelectedVendor({ ...selectedVendor, address: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="GST Number"
                            value={selectedVendor.gstNumber}
                            onChange={(e) => setSelectedVendor({ ...selectedVendor, gstNumber: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="PAN Number"
                            value={selectedVendor.panNumber}
                            onChange={(e) => setSelectedVendor({ ...selectedVendor, panNumber: e.target.value })}
                            fullWidth
                        />
                        {/*<TextField*/}
                        {/*    label="Website URL"*/}
                        {/*    value={selectedVendor.websiteUrl}*/}
                        {/*    onChange={(e) => setSelectedVendor({ ...selectedVendor, websiteUrl: e.target.value })}*/}
                        {/*    fullWidth*/}
                        {/*/>*/}
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={selectedVendor.isActive}
                                    onChange={(e) => setSelectedVendor({ ...selectedVendor, isActive: e.target.checked })}
                                />
                            }
                            label="Active"
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)} color="secondary">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        color="primary"
                        disabled={!selectedVendor.name.trim() || !selectedVendor.contactPerson.trim() || !selectedVendor.contactNumber.trim()}
                    >
                        {isEdit ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Vendor;
