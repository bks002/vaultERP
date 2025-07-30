import React, { useState, useEffect } from 'react';
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
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Stack,
    Box,
    MenuItem,
    InputAdornment,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { useSelector } from 'react-redux';
import { getRateCard, createRateCard } from '../../Services/InventoryService.jsx';
import { getCategories } from '../../Services/InventoryService.jsx';
import { getAllItems,getVendors  } from '../../Services/InventoryService.jsx';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";


const RateCard = () => {
    const officeId = useSelector((state) => state.user.officeId);
    const userId = useSelector((state) => state.user.userId);
    const [rateCards, setRateCards] = useState([]);
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRateCard, setSelectedRateCard] = useState({
        CategoryId: '', ItemId: '', VendorId: '', Price: '', ValidTill: ''
    });
    const [vendors, setVendors] = useState([]);


    useEffect(() => {
        if (officeId > 0) {
            loadRateCards();
            loadCategories();
            loadItems();
            loadVendors();
        }
    }, [officeId]);


    const loadRateCards = async () => {
        try {
            setLoading(true);
            const data = await getRateCard(officeId);
            setRateCards(data);
        } catch (error) {
            console.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const loadVendors = async () => {
        try {
            const data = await getVendors(officeId);
            setVendors(data);
        } catch (error) {
            console.error(error.message);
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
    const loadItems = async () => {
        try {
            const data = await getAllItems(officeId);
            setItems(data);
        } catch (error) {
            console.error(error.message);
        }
    };
    // ---- Event Handlers ----
    const handleCategoryChange = (categoryId) => {
        setSelectedRateCard({ ...selectedRateCard, CategoryId: categoryId, ItemId: '' });
        const itemsForCategory = items.filter((item) => item.categoryId === categoryId);
        setFilteredItems(itemsForCategory);
    };
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this rate card?')) return;

        try {
            // await deleteRateCard(id);
            alert('Rate card deleted successfully!');
            loadRateCards();
        } catch (error) {
            alert(error.message);
        }
    };
    const handleCreateNew = () => {
        setSelectedRateCard({ CategoryId: '', ItemId: '', VendorId: '', Price: '', ValidTill: '' }); // reset
        setFilteredItems([]);
        setDialogOpen(true);
    };
    const handleSave = async () => {
        try {
            await createRateCard({ ...selectedRateCard, officeId });
            alert('Rate card created successfully!');
            setDialogOpen(false);
            loadRateCards();
        } catch (error) {
            alert(error.message);
        }
    };
 const filteredRateCards = rateCards.filter((rate) =>
        rate.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rate.vendorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         rate.categoryName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return (
        <div className="col-12">
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h4">Rate Card</Typography>
                <Box display="flex" alignItems="center" gap={2}>
                    <TextField
                        placeholder="Search by Category, Item, Vendor"
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
                        Create New Rate Card
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
                                <TableCell>Category</TableCell>
                                <TableCell>Item</TableCell>
                                <TableCell>Vendor</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell>Valid Till</TableCell>
                                <TableCell align="center">Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredRateCards.length > 0 ? (
                                filteredRateCards.map((rateCard, index) => (
                                    <TableRow key={rateCard.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{rateCard.categoryName}</TableCell>
                                        <TableCell>{rateCard.itemName}</TableCell>
                                        <TableCell>{rateCard.vendorName}</TableCell>
                                        <TableCell>₹{rateCard.price}</TableCell>
                                        <TableCell>
                                            {rateCard.validTill
                                                ? new Date(rateCard.validTill).toLocaleDateString('en-IN', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })
                                                : '-'}
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton color="error" onClick={() => handleDelete(rateCard.id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        No rate cards found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* ---- Dialog for Create ---- */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Create New Rate Card</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        {/* Category Dropdown */}
                        <TextField
                            select
                            label="Category"
                            value={selectedRateCard.CategoryId}
                            onChange={(e) => {
                                handleCategoryChange(parseInt(e.target.value));
                            }}
                            fullWidth
                        >
                            <MenuItem value="">Select Category</MenuItem>
                            {categories.map((category) => (
                                <MenuItem key={category.id} value={category.id}>
                                    {category.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        {/* Item Dropdown */}
                        <TextField
                            select
                            label="Item"
                            value={selectedRateCard.ItemId}
                            onChange={(e) => setSelectedRateCard({ ...selectedRateCard, ItemId: e.target.value })}
                            fullWidth
                            disabled={!selectedRateCard.CategoryId}
                        >
                            <MenuItem value="">Select Item</MenuItem>
                            {filteredItems.map((item) => (
                                <MenuItem key={item.id} value={item.id}>
                                    {item.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="Vendor"
                            value={selectedRateCard.VendorId}
                            onChange={(e) => setSelectedRateCard({ ...selectedRateCard, VendorId: e.target.value })}
                            fullWidth
                        >
                            <MenuItem value="">Select Vendor</MenuItem>
                            {vendors.map((vendor) => (
                                <MenuItem key={vendor.id} value={vendor.id}>
                                    {vendor.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="Price"
                            value={selectedRateCard.Price}
                            onChange={(e) => setSelectedRateCard({ ...selectedRateCard, Price: e.target.value })}
                            fullWidth
                        />
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="Valid Till"
                                value={selectedRateCard.ValidTill ? new Date(selectedRateCard.ValidTill) : null}
                                onChange={(newValue) =>
                                    setSelectedRateCard({ ...selectedRateCard, ValidTill: newValue })
                                }
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                    },
                                }}
                            />
                        </LocalizationProvider>
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
                        disabled={
                            !selectedRateCard.CategoryId ||
                            !selectedRateCard.ItemId ||
                            !selectedRateCard.VendorId ||
                            !selectedRateCard.Price?.toString().trim() ||
                            !selectedRateCard.ValidTill
                        }
                    >
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default RateCard;
