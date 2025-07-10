import React, { useEffect, useState } from "react";
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
    getCategories,
    getVendors,
    fetchFilteredRate,
} from "../../Services/InventoryService.jsx";
import POQuantity from "./POQuantity.jsx";

const CreatePurchaseOrder = ({ open, onClose, officeId }) => {
    const [categories, setCategories] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [selectedVendorId, setSelectedVendorId] = useState("");
    const [items, setItems] = useState([]);
    const [selectedItemIds, setSelectedItemIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [poQuantityOpen, setPoQuantityOpen] = useState(false);
    const [selectedItemsForPO, setSelectedItemsForPO] = useState([]);


    // Load categories and vendors
    useEffect(() => {
        const loadData = async () => {
            if (!officeId) return;

            setLoading(true);
            try {
                const categoryData = await getCategories(officeId);
                const vendorData = await getVendors(officeId);
                const data = await fetchFilteredRate(officeId);
                setCategories(categoryData);
                setVendors(vendorData);
                setItems(data || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        if (officeId && open) {
            loadData();
        }
    }, [officeId, open]);

    // Load items based on category/vendor
    useEffect(() => {
        const loadItems = async () => {
            if (!officeId) return;

            setLoading(true);
            try {
                const category = selectedCategoryId || null;
                const vendor = selectedVendorId || null;
                const data = await fetchFilteredRate(officeId, category, null, vendor);
                setItems(data || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        if (open) loadItems();
    }, [officeId, selectedCategoryId, selectedVendorId, open]);

    const handleCreate = async () => {
        if (selectedItemIds.length === 0) {
            alert("Please select a vendor and at least one item.");
            return;
        }
        const poItems = Array.from(selectedItemIds.ids).map((itemId) => {
            const item = items.find((i) => (i.id) === (itemId));
            return {
                itemId,
                itemName: item.itemName,
                vendorId: item.vendorId,
                vendorName:item.vendorName,
                description: item.description,
                brandName: item.brandName,
                quantity: 0, // Default quantity
                rate: item.price,
                lineTotal:0
            };
        });
        setSelectedItemsForPO(poItems);
        setPoQuantityOpen(true);
    };

    const columns = [
        { field: "itemName", headerName: "Item Name", flex: 1 },
        { field: "description", headerName: "Description", flex: 2 },
        { field: "brandName", headerName: "Brand", flex: 1 },
        { field: "price", headerName: "Price", flex: 1 },
        { field: "measurementUnit", headerName: "Unit", flex: 1 },
    ];

    return (
        <>
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>Create Purchase Order</DialogTitle>
            <DialogContent>
                <Box mt={2}>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Vendor</InputLabel>
                        <Select
                            value={selectedVendorId}
                            onChange={(e) => setSelectedVendorId(e.target.value)}
                        >
                            <MenuItem value="">All Vendors</MenuItem>
                            {vendors.map((vendor) => (
                                <MenuItem key={vendor.id} value={vendor.id}>
                                    {vendor.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={selectedCategoryId}
                            onChange={(e) => setSelectedCategoryId(e.target.value)}
                        >
                            <MenuItem value="">All Categories</MenuItem>
                            {categories.map((category) => (
                                <MenuItem key={category.id} value={category.id}>
                                    {category.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Typography variant="h6" mt={2}>
                        Select Items
                    </Typography>

                    <div style={{ height: 400, width: "100%" }}>
                        <DataGrid
                            columns={columns}
                            rows={items}
                            initialState={{
                                pagination: {
                                    paginationModel: {
                                        pageSize: 5,
                                    },
                                },
                            }}
                            pageSizeOptions={[5]}
                            getRowId={(row) => row.id}
                            onRowSelectionModelChange={(newSelection) => {
                                setSelectedItemIds(newSelection);
                            }}
                            checkboxSelection
                            loading={loading}
                        />
                    </div>
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    Cancel
                </Button>
                <Button
                    onClick={handleCreate}
                    variant="contained"
                    color="primary"
                    disabled={selectedItemIds.length === 0}
                >
                    Place Order
                </Button>
            </DialogActions>
        </Dialog>
            <POQuantity
                open={poQuantityOpen}
                selectedItems={selectedItemsForPO}
                onClose={() => {setPoQuantityOpen(false);
                onClose()}}
            />

        </>
    );
};

export default CreatePurchaseOrder;

