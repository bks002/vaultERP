import React, { useEffect, useState } from 'react';
import {
    Container, Typography, Button, TextField, Dialog,
    DialogTitle, DialogContent, DialogActions, Box,
    Table, TableHead, TableRow, TableCell, TableBody, Stack, InputAdornment,
} from '@mui/material';
//import { createType, updateType, deleteType } from "../../Services/OfficeService";
import AlertSnackbar from "../../Components/Alert/AlertSnackBar";
import SearchIcon from '@mui/icons-material/Search';
const AssetOperationMaster = () => {
    const [type, setType] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
     const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState({
        typeName: '',
        description: '',
        action: ''
    });

    const [alert, setAlert] = useState({ open: false, type: 'success', message: '' });

    const showAlert = (type, message) => {
        setAlert({ open: true, type, message });
    };

    const handleCreate = () => {
        setIsEdit(false);
        setSelectedType({ typeName: '', description: '', });
        setDialogOpen(true);
    };

    const handleEdit = (typeItem) => {
        setSelectedType(typeItem);
        setIsEdit(true);
        setDialogOpen(true);
    };

    const handleView = (typeItem) => {
        setSelectedType(typeItem);
        setViewOpen(true);
    };

    const handleDelete = async (typeItem) => {
        if (window.confirm(`Are you sure you want to delete "${typeItem.typeName}"?`)) {
            try {
                await deleteType(typeItem.typeId);
                showAlert('success', 'Type deleted successfully');
                // reload list if needed
            } catch {
                showAlert('error', 'Failed to delete type');
            }
        }
    };

    const handleChange = (e) => {
        setSelectedType({ ...selectedType, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        console.log('Saving type:', selectedType);
       /* try {
            if (isEdit) {
                await updateType(selectedType.typeId, {
                    name: selectedType.typeName,
                    description: selectedType.description,
                });
                showAlert('success', 'Type updated successfully');
            } else {
                await createType({
                    // Assuming officeId is a static value for now
                    name: selectedType.typeName,
                    description: selectedType.description,
                    createdBy: 1, // Assuming createdBy is a static value for now

                });
                showAlert('success', 'Type added successfully');
            }
            setDialogOpen(false);
            // reload list if needed
        } catch {
            showAlert('error', 'Failed to save type');
        }*/
    };
 const filteredTypes = type.filter((t) =>
        t.typeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return (
         <Container maxWidth={false}>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h4">Asset Operation Master</Typography>
                <Box display="flex" gap={2}>
                    {/* ✅ Search input */}
                    <TextField
                        placeholder="Search by type or description"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        size="small"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button variant="contained" onClick={handleCreate}>
                        Add Type
                    </Button>
                </Box>
            </Box>

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredTypes.length > 0 ? (
                        filteredTypes.map((item, index) => (
                            <TableRow key={item.typeId}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{item.typeName}</TableCell>
                                <TableCell>{item.description}</TableCell>
                                <TableCell align="center">
                                    <Tooltip title="Edit">
                                        <IconButton color="primary" onClick={() => handleEdit(AssetTypeMaster)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                        <IconButton color="error" onClick={() => handleDelete(AssetTypeMaster)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} align="center">No type found</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>{isEdit ? 'Edit Type' : 'Add Type'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField
                            label="Type Name"
                            name="typeName"
                            value={selectedType.typeName}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            label="Description"
                            name="description"
                            value={selectedType.description}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>
                        {isEdit ? 'Update' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* View Dialog */}
            <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>View Type</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField label="Type" value={selectedType.typeName} fullWidth disabled />
                        <TextField label="Description" value={selectedType.description} fullWidth disabled />
                        <TextField label="Action" value={selectedType.action} fullWidth disabled />
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

export default AssetOperationMaster;
