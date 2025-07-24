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
import { getPartyMasters, createPartyMaster, updatePartyMaster, deletePartyMaster } from '../../Services/PartyMasterService';
import { useSelector } from 'react-redux';

const PartyMaster = () => {
    const officeId = useSelector((state) => state.user.officeId);
     const [searchQuery, setSearchQuery] = useState('');
    const userId = useSelector((state) => state.user.userId);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState({
        office_id: '',
        name: '',
        contact_person: '',
        contact_number: '',
        email: '',
        address: '',
        gst_number: '',
        pan_number: '',
        is_approved: true,
        approved_by:'',
        created_by: userId,
        created_on:'',
        is_active: true,
        pan_url: '',
        gst_certificate_url: '',
        company_brochure_url:'',
        website_url: '',




    });
    const [isEdit, setIsEdit] = useState(false);

    const loadVendors = async () => {
        try {
            const data = await getPartyMasters(officeId);
            setVendors(data);
        } catch (error) {
            console.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVendors();
    },[officeId] );

    const handleEdit = (vendor) => {
        setSelectedVendor(vendor);
        setIsEdit(true);
        setDialogOpen(true);
    };

    const handleDelete = async (vendor) => {
        if (window.confirm(`Are you sure you want to delete "${vendor.name}"?`)) {
            try {
                await deletePartyMaster(vendor.id);
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
    office_id: 'officeId',
    name: '',
    contact_person: '',
    contact_number: '',
    email: '',
    address: '',
    gst_number: '',
    pan_number: '',
    created_by: userId,
    created_on: new Date().toISOString(),
    is_active: true,
    pan_url: '',
    gst_certificate_url: '',
    company_brochure_url: '',
    website_url: '',
    is_approved: true,
    approved_by: userId,
});

        setIsEdit(false);
        setDialogOpen(true);
    };

    const handleSave = async () => {
        try {
            if (isEdit) {
                await updatePartyMaster(selectedVendor.id, selectedVendor);
                alert('Vendor updated successfully!');
            } else {
        await createPartyMaster({
        ...selectedVendor,
         office_id: officeId,
         created_by: userId
        }
        );
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
        v.contact_person?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.contact_number?.includes(searchQuery) ||
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
                                        <TableCell>{vendor.contact_person}</TableCell>
                                        <TableCell>{vendor.contact_number}</TableCell>
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
                                        No party found.
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
                            value={selectedVendor.contact_person}
                            onChange={(e) => setSelectedVendor({ ...selectedVendor, contact_person: e.target.value })}
                            required
                            fullWidth
                        />
                        <TextField
                            label="Contact Number"
                            value={selectedVendor.contact_number}
                            onChange={(e) => setSelectedVendor({ ...selectedVendor, contact_number: e.target.value })}
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
                            value={selectedVendor.gst_number}
                            onChange={(e) => setSelectedVendor({ ...selectedVendor, gst_number: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="PAN Number"
                            value={selectedVendor.pan_number}
                            onChange={(e) => setSelectedVendor({ ...selectedVendor, pan_number: e.target.value })}
                            fullWidth
                        />
                        <TextField
                           label="Website URL"
                            value={selectedVendor.website_url}
                            onChange={(e) => setSelectedVendor({ ...selectedVendor, website_url: e.target.value })}
                            fullWidth
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={selectedVendor.is_active}
                                    onChange={(e) => setSelectedVendor({ ...selectedVendor, is_active: e.target.checked })}
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
                        disabled={!selectedVendor.name.trim() || !selectedVendor.contact_person.trim() || !selectedVendor.contact_number.trim()}
                    >
                        {isEdit ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default PartyMaster;
