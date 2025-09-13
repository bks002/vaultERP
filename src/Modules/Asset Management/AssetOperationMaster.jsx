import React, { useEffect, useState } from 'react';
import {
    Container, Typography, Button, TextField, Dialog,
    DialogTitle, DialogContent, DialogActions, Box,
    Table, TableHead, TableRow, TableCell, TableBody, Stack, InputAdornment,
} from '@mui/material';
import { getAllOperation, createOperation } from '../../Services/OperationService';
import AlertSnackbar from "../../Components/Alert/AlertSnackBar";
import { useSelector } from 'react-redux';
import SearchIcon from '@mui/icons-material/Search';
import ExportCSVButton from '../../Components/Export to CSV/ExportCSVButton';

const AssetOperationMaster = () => {
    const [type, setType] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    // Inside component state
    const [selectedType, setSelectedType] = useState({
        operationCode: '',
        operationName: '',
        description: '',
    });
    const officeId = useSelector((state) => state.user.officeId);
    const userId = useSelector((state) => state.user.userId);
    const [alert, setAlert] = useState({ open: false, type: 'success', message: '' });

    const showAlert = (type, message) => {
        setAlert({ open: true, type, message });
    };

    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const response = await getAllOperation(officeId);
                setType(response);
            } catch (error) {
                showAlert('error', 'Failed to fetch types');
                setType([]);
            }
        };
        fetchTypes();
    }, [officeId]);

    const handleCreate = () => {
        setSelectedType({ operationCode: '', operationName: '', description: '', officeId, createdBy: userId });
        setDialogOpen(true);
    };
    const handleChange = (e) => {
        setSelectedType({ ...selectedType, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            await createOperation(selectedType);
            showAlert('success', 'Operation added successfully');
            fetchTypes();
            setDialogOpen(false);
        } catch {
            showAlert('error', 'Failed to save operation');
        }
    };
    const filteredOperation = type.filter((v) =>
        v.machineName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.operationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.manpower?.includes(searchQuery) ||
        v.item?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const csvHeaders = [
        { label: 'Operation Code', key: 'operationCode' },
        { label: 'Operation Name', key: 'operationName' },
        { label: 'Description', key: 'description' },
    ];

    return (
        <Container maxWidth={false}>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h4">Asset Operation Master</Typography>
                <Box display="flex" alignItems="center" gap={2}>
                    <TextField
                        placeholder="Search by name, description"
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
                        data={filteredOperation}
                        filename="AssetOperations.csv"
                        headers={csvHeaders}
                    />
                    <Button variant="contained" color="primary" onClick={handleCreate}>
                        Add Operation
                    </Button>
                </Box>
            </Box>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Operation Code</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredOperation.length > 0 ? (
                        filteredOperation.map((item, index) => (
                            <TableRow key={item.typeId}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{item.operationName}</TableCell>
                                <TableCell>{item.description}</TableCell>
                                <TableCell>{item.operationCode}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} align="center">No type found</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Create Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Add Operation</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField
                            label="Operation Code"
                            name="operationCode"
                            value={selectedType.operationCode}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            label="Operation Name"
                            name="operationName"
                            value={selectedType.operationName}
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
                        Save
                    </Button>
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
