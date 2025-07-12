import React, { useEffect, useState } from 'react';
import SearchIcon from "@mui/icons-material/Search";
import {
    Table, TableBody, TableCell, TableHead, TableRow,
    TableContainer, IconButton, Paper, Typography,
    Tooltip, Box, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Stack,
    InputAdornment,
} from '@mui/material';
import ViewIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSelector } from 'react-redux';
import { getAllShift, createShifts, editShifts, deleteShifts } from '../../Services/ShiftService';

const ShiftMaster = () => {
    const officeId = useSelector((state) => state.user.officeId);
    const userId = useSelector((state) => state.user.userId);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState({
        shiftId: '',
        shiftName: '',
        shiftCode: '',
        startTime: '',
        endTime: ''
    });
    const [isEdit, setIsEdit] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const loadCategories = async () => {
        try {
            setLoading(true);
            const data = await getAllShift(officeId);
            setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            setCategories([]);
            console.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (officeId > 0) loadCategories();
    }, [officeId]);

    const handleEdit = (category) => {
        setSelectedCategory(category);
        setIsEdit(true);
        setDialogOpen(true);
    };

    const handleView = (category) => {
        alert(`Viewing Shift:\nName: ${category.shiftName}\nCode: ${category.shiftCode}\nStart: ${category.startTime}\nEnd: ${category.endTime}`);
    };

    const handleDelete = async (category) => {
        if (window.confirm(`Are you sure you want to delete "${category.shiftName}"?`)) {
            try {
                await deleteShifts(category.id || category.shiftId);
                alert('Shift deleted successfully!');
                loadCategories();
            } catch (error) {
                alert(error.message);
            }
        }
    };

    const handleCreateNew = () => {
        setSelectedCategory({ shiftName: '', shiftCode: '', startTime: '', endTime: '' });
        setIsEdit(false);
        setDialogOpen(true);
    };

    const handleSave = async () => {
        try {
            const payload = {
                shiftName: selectedCategory.shiftName,
                shiftCode: selectedCategory.shiftCode,
                startTime: selectedCategory.startTime,
                endTime: selectedCategory.endTime,
                officeId,
                createdBy: userId
            };

            if (isEdit) {
                await editShifts(selectedCategory.shiftId || selectedCategory.id, payload);
                alert('Shift updated successfully!');
            } else {
                await createShifts(payload);
                alert('Shift created successfully!');
            }

            setDialogOpen(false);
            loadCategories();
        } catch (error) {
            console.error("Error saving shift:", error);
            alert("Error saving shift: " + error.message);
        }
    };

    const filteredCategories = categories.filter((category) => {
        const shiftName = category.shiftName || '';
        const shiftCode = category.shiftCode || '';
        return (
            shiftName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            shiftCode.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    return (
        <div className="col-12">
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h4" sx={{fontSize: {xs: '1.5rem', sm: '1.8rem',  md: '2rem' },
                 }}   >Shift Master</Typography>

                <Box display="flex" alignItems="center" gap={2}>
                    <TextField
                        placeholder="Search shift..."
                        variant="outlined"
                        sx={{ width: 200 }}
                        size="small"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button variant="contained" color="primary" onClick={handleCreateNew} sx={{ width: 200 }}>
                        ADD SHIFT
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
                                <TableCell>Shift Name</TableCell>
                                <TableCell>Shift Code</TableCell>
                                <TableCell>Start Time</TableCell>
                                <TableCell>End Time</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredCategories.length > 0 ? (
                                filteredCategories.map((category, index) => (
                                    <TableRow key={category.shiftId || category.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{category.shiftName}</TableCell>
                                        <TableCell>{category.shiftCode}</TableCell>
                                        <TableCell>{category.startTime}</TableCell>
                                        <TableCell>{category.endTime}</TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="View">
                                                <IconButton color="info" onClick={() => handleView(category)}>
                                                    <ViewIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Edit">
                                                <IconButton color="primary" onClick={() => handleEdit(category)}>
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton color="error" onClick={() => handleDelete(category)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        No matching shift found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>{isEdit ? 'Edit Shift' : 'Create New Shift'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField
                            label="Shift Name"
                            value={selectedCategory.shiftName}
                            onChange={(e) => setSelectedCategory({ ...selectedCategory, shiftName: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Shift Code"
                            value={selectedCategory.shiftCode}
                            onChange={(e) => setSelectedCategory({ ...selectedCategory, shiftCode: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Start Time"
                            type="time"
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ step: 1 }}
                            value={selectedCategory.startTime}
                            onChange={(e) => setSelectedCategory({ ...selectedCategory, startTime: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="End Time"
                            type="time"
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ step: 1 }}
                            value={selectedCategory.endTime}
                            onChange={(e) => setSelectedCategory({ ...selectedCategory, endTime: e.target.value })}
                            fullWidth
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
                        disabled={!selectedCategory.shiftName.trim() || !selectedCategory.shiftCode.trim()}
                    >
                        {isEdit ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ShiftMaster;
