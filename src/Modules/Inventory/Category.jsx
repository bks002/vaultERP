import React, { useEffect, useState } from 'react';
import SearchIcon from "@mui/icons-material/Search";
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
    InputAdornment,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
    getCategories,
    deleteCategory,
    createCategory,
    updateCategory,
} from '../../Services/InventoryService.jsx';
import { useSelector } from 'react-redux';

const Category = () => {
    const officeId = useSelector((state) => state.user.officeId);
    const userId = useSelector((state) => state.user.userId);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState({ name: '', description: '', isActive: false, isApproved: false });
    const [isEdit, setIsEdit] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const loadCategories = async () => {
        try {
            setLoading(true);
            const data = await getCategories(officeId);
            setCategories(data);
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

    const handleDelete = async (category) => {
        if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
            try {
                await deleteCategory(category.id);
                alert('Category deleted successfully!');
                loadCategories();
            } catch (error) {
                alert(error.message);
            }
        }
    };

    const handleCreateNew = () => {
        setSelectedCategory({ name: '', description: '' });
        setIsEdit(false);
        setDialogOpen(true);
    };

    const handleSave = async () => {
        try {
            if (isEdit) {
                await updateCategory(selectedCategory.id, {
                    name: selectedCategory.name,
                    description: selectedCategory.description,
                    isActive: selectedCategory.isActive,
                    isApproved: selectedCategory.isApproved
                });
                alert('Category updated successfully!');
            } else {
                await createCategory({
                    officeId,
                    name: selectedCategory.name,
                    description: selectedCategory.description,
                    createdBy: userId,
                });
            }
            setDialogOpen(false);
            loadCategories();
        } catch (error) {
            alert(error.message);
        }
    };


    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="col-12">
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                {/* Title on the left */}
                <Typography variant="h4">Category Master</Typography>

                <Box display="flex" alignItems="center" gap={2}>
                    <TextField
                        placeholder="Category Name,	Description, Actions"
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
                        Create New Category
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
                                <TableCell>Category Name</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredCategories.length > 0 ? (
                                filteredCategories.map((category, index) => (
                                    <TableRow key={category.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{category.name}</TableCell>
                                        <TableCell>{category.description}</TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Edit">
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => handleEdit(category)}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleDelete(category)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        No matching categories found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Create/Edit Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>{isEdit ? 'Edit Category' : 'Create New Category'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField
                            label="Category Name"
                            value={selectedCategory.name}
                            onChange={(e) =>
                                setSelectedCategory({ ...selectedCategory, name: e.target.value })
                            }
                            fullWidth
                        />
                        <TextField
                            label="Description"
                            value={selectedCategory.description}
                            onChange={(e) =>
                                setSelectedCategory({ ...selectedCategory, description: e.target.value })
                            }
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
                        disabled={!selectedCategory.name.trim()}
                    >
                        {isEdit ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Category;
