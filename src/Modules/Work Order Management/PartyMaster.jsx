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
     Container,
    InputAdornment,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import {
    getVendors,
    deleteVendor,
    createVendor,
    updateVendor,
} from '../../Services/InventoryService.jsx';

const PartyMaster = () => {
     const [searchQuery, setSearchQuery] = useState('');
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

    const [formData, setFormData] = useState();
    
      const showAlert = (type, message) => {
        setAlert({ open: true, type, message });
      };

    

    useEffect(() => {
        
    }, )

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
        console.log('Creating new vendor');
        setSelectedVendor({
            name: '', contactPerson: '', contactNumber: '', email: '', address: '', gstNumber: '', panNumber: '', websiteUrl: '', isActive: true,
        });
        setIsEdit(false);
        setDialogOpen(true);
    };

            const handleSave = async () => {
            const payload = {
            name: formData.name || 0,           
            contactPerson: formData.contactPerson || "",
            contactNumber: formData.contactNumber || "",
            email: formData.email || "",
            address: formData.address || "",
            gstNumber: formData.gstNumber || "",
            panNumber: formData.panNumber || "",
            websiteUrl: formData.websiteUrl || "",
            isActive: formData.isActive || "",
            createdBy: String(userId),
            };
            console.log(payload)

        try {
            if (isEdit) {
                await updateVendor(selectedVendor.id, selectedVendor);
                alert('Vendor updated successfully!');
            } else {
                await createVendor({ ...selectedVendor, officeId, createdBy: userId });
                alert('Vendor created successfully!');
            }
            setDialogOpen(false);
            loadVendors();
        } catch (error) {
            alert(error.message);
        }
    };
 const filteredVendors = vendors.filter((v) =>
        v.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.contactNumber?.includes(searchQuery) ||
        v.email?.toLowerCase().includes(searchQuery.toLowerCase()) 
 );
    return (
        <div className="col-12">
             <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h4">Party Master</Typography>
                <Box display="flex" alignItems="center" gap={2}>
                    <TextField
                        placeholder="Search by name, person or number"
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
                    <Button variant="contained" color="primary" onClick={handleCreateNew}>
                        Create New Party Master
                    </Button>
                </Box>
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
                            {filteredVendors.length > 0 ? (
                                filteredVendors.map((vendor, index) => (
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
                <DialogTitle>{isEdit ? 'Edit Vendor' : 'Create New Party Master'}</DialogTitle>
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

export default PartyMaster;
