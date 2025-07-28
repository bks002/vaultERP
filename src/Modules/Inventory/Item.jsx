import React, { useEffect, useState } from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableRow, TableContainer,
    IconButton, Paper, Typography, Tooltip, Box, Button, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField, Stack,
    MenuItem, InputAdornment
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import {
    getAllItems, deleteItem, createItem, updateItem, getCategories
} from '../../Services/InventoryService';
import { useSelector } from 'react-redux';
import ExportCSVButton from '../../Components/Export to CSV/ExportCSVButton';

const ItemMaster = () => {
    const officeId = useSelector((state) => state.user.officeId);
    const userId = useSelector((state) => state.user.userId);

    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [selectedItem, setSelectedItem] = useState({
        id: '',
        name: '',
        description: '',
        categoryId: '',
        measurementUnit: '',
        minStockLevel: '',
        brandName: '',
        hsnCode: '',
    });

    useEffect(() => {
        if (officeId > 0) {
            loadItems();
            loadCategories();
        }
    }, [officeId]);

    const loadItems = async () => {
        try {
            setLoading(true);
            const data = await getAllItems(officeId);
            setItems(data);
        } catch (error) {
            console.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const data = await getCategories(officeId);
            setCategories(data);
        } catch (error) {
            console.error(error.message);
        }
    };

    const getCategoryName = (categoryId) => {
        return categories.find((cat) => cat.id === categoryId)?.name || 'N/A';
    };

    const filteredItems = items.filter((item) =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getCategoryName(item.categoryId)?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateNew = () => {
        setSelectedItem({
            id: '',
            name: '',
            description: '',
            categoryId: '',
            measurementUnit: '',
            minStockLevel: '',
            brandName: '',
            hsnCode: '',
        });
        setIsEdit(false);
        setDialogOpen(true);
    };

    const handleEdit = (item) => {
        setSelectedItem({
            id: item.id,
            name: item.name,
            description: item.description,
            categoryId: item.categoryId,
            measurementUnit: item.measurementUnit,
            minStockLevel: item.minStockLevel,
            brandName: item.brandName,
            hsnCode: item.hsnCode,
        });
        setIsEdit(true);
        setDialogOpen(true);
    };

    const handleView = (item) => {
        setSelectedItem(item);
        setViewOpen(true);
    };

    const handleDelete = async (item) => {
        if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
            try {
                await deleteItem(item.id);
                alert('Item deleted successfully!');
                loadItems();
            } catch (error) {
                alert(error.message);
            }
        }
    };

    const handleSave = async () => {
        const payload = {
            name: selectedItem.name,
            description: selectedItem.description,
            categoryId: selectedItem.categoryId,
            measurementUnit: selectedItem.measurementUnit,
            minStockLevel: selectedItem.minStockLevel,
            brandName: selectedItem.brandName,
            hsnCode: selectedItem.hsnCode,
            officeId,
            createdBy: userId,
        };

        try {
            if (isEdit) {
                await updateItem(selectedItem.id, payload);
                alert('Item updated successfully!');
            } else {
                await createItem(payload);
                alert('Item created successfully!');
            }
            setDialogOpen(false);
            loadItems();
        } catch (error) {
            alert(error.message);
        }
    };
    const csvHeaders = [
        { label: "Item ID", key: "id" },
        { label: "Item Name", key: "name" },
        { label: "Description", key: "description" },
        { label: "Category", key: "categoryId" },
        { label: "Measurement Unit", key: "measurementUnit" },
        { label: "Minimum Stock Level", key: "minStockLevel" },
        { label: "Brand Name", key: "brandName" },
        { label: "HSN Code", key: "hsnCode" },
    ];

    return (
        <div className="col-12">
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h4">Item Master</Typography>
                <Box display="flex" alignItems="center" gap={2}>
                   <TextField
                        placeholder="Search by Item Name, Description or Category"
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
                        data={filteredItems}
                        filename={`Item.csv`}
                        headers={csvHeaders}
                    />
                    <Button variant="contained" color="primary" onClick={handleCreateNew}>
                        Create New Item
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
                                <TableCell>Item Name</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredItems.length > 0 ? (
                                filteredItems.map((item, index) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>{item.description}</TableCell>
                                        <TableCell>{getCategoryName(item.categoryId)}</TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="View">
                                                <IconButton color="info" onClick={() => handleView(item)}>
                                                    <VisibilityIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Edit">
                                                <IconButton color="primary" onClick={() => handleEdit(item)}>
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton color="error" onClick={() => handleDelete(item)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">No items found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>{isEdit ? 'Edit Item' : 'Create New Item'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField
                            select
                            label="Category"
                            value={selectedItem.categoryId || ''}
                            onChange={(e) => setSelectedItem({ ...selectedItem, categoryId: e.target.value })}
                            fullWidth
                        >
                            <MenuItem value="">Select Category</MenuItem>
                            {categories.map((cat) => (
                                <MenuItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField label="Item Name" value={selectedItem.name} onChange={(e) => setSelectedItem({ ...selectedItem, name: e.target.value })} fullWidth />
                        <TextField label="Description" value={selectedItem.description} onChange={(e) => setSelectedItem({ ...selectedItem, description: e.target.value })} fullWidth />
                        <TextField label="Measurement Unit" value={selectedItem.measurementUnit} onChange={(e) => setSelectedItem({ ...selectedItem, measurementUnit: e.target.value })} fullWidth />
                        <TextField label="Minimum Stock Level" value={selectedItem.minStockLevel} onChange={(e) => setSelectedItem({ ...selectedItem, minStockLevel: e.target.value })} fullWidth />
                        <TextField label="Brand Name" value={selectedItem.brandName} onChange={(e) => setSelectedItem({ ...selectedItem, brandName: e.target.value })} fullWidth />
                        <TextField label="HSN Code" value={selectedItem.hsnCode} onChange={(e) => setSelectedItem({ ...selectedItem, hsnCode: e.target.value })} fullWidth />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)} color="secondary">Cancel</Button>
                    <Button onClick={handleSave} variant="contained" color="primary" disabled={!selectedItem.name?.trim()}>
                        {isEdit ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* View Dialog */}
            <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>View Item</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField label="Category" value={getCategoryName(selectedItem.categoryId)} fullWidth disabled />
                        <TextField label="Name" value={selectedItem.name} fullWidth disabled />
                        <TextField label="Description" value={selectedItem.description} fullWidth disabled />
                        <TextField label="Measurement Unit" value={selectedItem.measurementUnit} fullWidth disabled />
                        <TextField label="Minimum Stock Level" value={selectedItem.minStockLevel} fullWidth disabled />
                        <TextField label="Brand Name" value={selectedItem.brandName} fullWidth disabled />
                        <TextField label="HSN Code" value={selectedItem.hsnCode} fullWidth disabled />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewOpen(false)} color="secondary">Close</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ItemMaster;