import React, { useEffect, useState } from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableRow, TableContainer, IconButton,
    Paper, Typography, Tooltip, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Stack, Switch, FormControlLabel, InputAdornment, Select, MenuItem, InputLabel,
    FormControl, Checkbox
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import ViewIcon from '@mui/icons-material/Visibility';
import { useSelector } from 'react-redux';
import { getProductMasters } from "../../Services/ProductMasterService";
import { getPartyMasters } from '../../Services/PartyMasterService';
import { getWorkOrders, createWorkOrder, updateWorkOrder, deleteWorkOrder } from '../../Services/WorkOrderService';

const WorkOrder = () => {
    const officeId = useSelector((state) => state.user.officeId);
    const userId = useSelector((state) => state.user.userId);
    const [searchQuery, setSearchQuery] = useState('');
    const [workOrders, setWorkOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedWorkOrder, setSelectedWorkOrder] = useState({
        partyId: '', poNo: '', poDate: '', products: [],
        poAmount: '', boardName: '', isActive: true, officeId: officeId,
    });
    const [isEdit, setIsEdit] = useState(false);
    const [isView, setIsView] = useState(false);
    const [partyList, setPartyList] = useState([]);
    const [productList, setProductList] = useState([]);
    const [productDialogOpen, setProductDialogOpen] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [productSearch, setProductSearch] = useState("");

    useEffect(() => {
        if (officeId) {
            loadWorkOrders();
            fetchPartyList();
            fetchProductList();
        }
    }, [officeId]);

    const loadWorkOrders = async () => {
        setLoading(true);
        setWorkOrders(await getWorkOrders(officeId));
        setLoading(false);
    };

    const fetchPartyList = async () => {
        try {
            const data = await getPartyMasters(officeId);
            setPartyList(data);
        } catch (error) {
            alert('Failed to fetch party list');
        }
    };

    const fetchProductList = async () => {
        try {
            const data = await getProductMasters(officeId);
            setProductList(data);
        } catch (error) {
            alert('Failed to fetch product list');
        }
    };

    // const handleEdit = async (workOrder) => {
    //     if (!partyList.length) {
    //         await fetchPartyList();
    //     }
    //     const enrichedProducts = workOrder.products.map(p => {
    //         const fullProduct = productList.find(prod => prod.id === p.productId);
    //         return {
    //             ...p,
    //             productName: fullProduct?.product_name || ''
    //         };
    //     });
    //     setSelectedWorkOrder({
    //         ...workOrder,
    //         partyId: String(workOrder.partyId),
    //         products: enrichedProducts
    //     });
    //     setIsEdit(true);
    //     setDialogOpen(true);
    // };

    const handleView = (workOrder) => {
        const enrichedProducts = workOrder.products.map(p => {
            const fullProduct = productList.find(prod => String(prod.id) === String(p.productId));
            return {
                ...p,
                productName: fullProduct?.product_name || ''
            };
        });
        setSelectedWorkOrder({ ...workOrder, products: enrichedProducts });
        setIsEdit(false);
        setIsView(true);
        setDialogOpen(true);
    };

    const handleDelete = async (workOrder) => {
        if (window.confirm(`Are you sure you want to delete Work Order "${workOrder.poNo}"?`)) {
            try {
                await deleteWorkOrder(workOrder.id, officeId);
                alert('Work Order deleted successfully!');
                loadWorkOrders();
            } catch (error) {
                alert(error.message);
            }
        }
    };

    const handleCreateNew = () => {
        setSelectedWorkOrder({
            partyId: '', poNo: '', poDate: '', products: [],
            poAmount: '', boardName: '', isActive: true
        });
        setIsEdit(false);
        setDialogOpen(true);
    };

    const handleSave = async () => {
        try {
            const workOrderToSend = {
                ...selectedWorkOrder,
                isActive: selectedWorkOrder.isActive ? 1 : 0,
                partyId: selectedWorkOrder.partyId,
                products: selectedWorkOrder.products.map(p => ({
                    productId: p.productId,
                    quantity: p.quantity ?? '',
                    store: p.store ?? '',
                })),
                officeId: officeId,
                createdBy: userId,
                createdOn: new Date().toISOString(),
            };

            // if (isEdit) {
            //     await updateWorkOrder(selectedWorkOrder.id, workOrderToSend);
            //     alert('Work Order updated successfully!');
            // } else {
                await createWorkOrder(workOrderToSend);
                alert('Work Order created successfully!');
            // }
            setDialogOpen(false);
            loadWorkOrders();
        } catch (error) {
            alert(error.message);
        }
    };

    const handleAddProductClick = () => {
        setSelectedProducts([]);
        setProductDialogOpen(true);
    };

    const handleProductDialogClose = () => {
        setProductSearch('');
        setSelectedProducts([]);
        setProductDialogOpen(false);
    };

    const handleProductDialogConfirm = () => {
        const existingIds = selectedWorkOrder.products.map((p) => p.productId);
        const newProducts = productList
            .filter((p) => selectedProducts.includes(p.id) && !existingIds.includes(p.id))
            .map((p) => ({
                productId: p.id,
                productName: p.product_name,
                quantity: '',
                store: ''
            }));
        setSelectedWorkOrder({
            ...selectedWorkOrder,
            products: [...selectedWorkOrder.products, ...newProducts],
        });
        setProductDialogOpen(false);
    };

    const handleProductFieldChange = (index, field, value) => {
        const updatedProducts = selectedWorkOrder.products.map((p, i) =>
            i === index ? { ...p, [field]: value } : p
        );
        setSelectedWorkOrder({ ...selectedWorkOrder, products: updatedProducts });
    };

    const handleRemoveProduct = (index) => {
        const updatedProducts = selectedWorkOrder.products.filter((_, i) => i !== index);
        setSelectedWorkOrder({ ...selectedWorkOrder, products: updatedProducts });
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setIsView(false);
    };

    const filteredWorkOrders = workOrders.filter((wo) =>
        wo.poNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wo.partyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wo.boardName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="col-12">
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h4">Work Order</Typography>
                <Box display="flex" alignItems="center" gap={2}>
                    <TextField
                        placeholder="Search by PO No, Party Name, or Board Name"
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
                        Create New Work Order
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
                                <TableCell>PO Number</TableCell>
                                <TableCell>PO Date</TableCell>
                                <TableCell>PO Amount</TableCell>
                                <TableCell>Board Name</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredWorkOrders.length > 0 ? (
                                filteredWorkOrders.map((wo, index) => (
                                    <TableRow key={wo.id || index}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{wo.poNo}</TableCell>
                                        <TableCell>{wo.poDate}</TableCell>
                                        <TableCell>{wo.poAmount}</TableCell>
                                        <TableCell>{wo.boardName}</TableCell>
                                        <TableCell align="center">
                                            {/* <Tooltip title="Edit">
                                                <IconButton color="primary" onClick={() => handleEdit(wo)}>
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip> */}
                                            <Tooltip title="View">
                                                <IconButton color="primary" onClick={() => handleView(wo)}>
                                                    <ViewIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton color="error" onClick={() => handleDelete(wo)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={9} align="center">
                                        No work orders found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog
                open={dialogOpen}
                onClose={handleDialogClose}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>{isView ? 'View Work Order' : isEdit ? 'Edit Work Order' : 'Create New Work Order'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        {/* Party Dropdown */}
                        <FormControl fullWidth required>
                            <InputLabel id="party-select-label">Party</InputLabel>
                            <Select
                                labelId="party-select-label"
                                value={selectedWorkOrder.partyId}
                                label="Party"
                                onChange={(e) => setSelectedWorkOrder({ ...selectedWorkOrder, partyId: e.target.value })}
                                disabled={isView}
                            >
                                {partyList.map((party) => (
                                    <MenuItem key={party.id} value={party.id}>{party.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        {/* PO Number, PO Date, etc. */}
                        <TextField
                            label="PO Number"
                            value={selectedWorkOrder.poNo}
                            onChange={(e) => setSelectedWorkOrder({ ...selectedWorkOrder, poNo: e.target.value })}
                            required
                            fullWidth
                            disabled={isView}
                        />
                        <TextField
                            label="PO Date"
                            type="date"
                            value={selectedWorkOrder.poDate}
                            onChange={(e) => setSelectedWorkOrder({ ...selectedWorkOrder, poDate: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            required
                            fullWidth
                            disabled={isView}
                        />
                        {/* Product Table and Add Button */}
                        <Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography variant="subtitle1">Products</Typography>
                                {!isView && (
                                    <Button variant="outlined" size="small" onClick={handleAddProductClick} disabled={isView}>
                                        Add Product
                                    </Button>
                                )}
                            </Box>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Quantity</TableCell>
                                        <TableCell>Store</TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {selectedWorkOrder.products && selectedWorkOrder.products.length > 0 ? (
                                        selectedWorkOrder.products.map((prod, idx) => (
                                            <TableRow key={prod.productId || idx}>
                                                <TableCell>{prod.productName}</TableCell>
                                                <TableCell>
                                                    <TextField
                                                        value={prod.quantity || ''}
                                                        onChange={(e) => handleProductFieldChange(idx, 'quantity', e.target.value)}
                                                        size="small"
                                                        type="number"
                                                        inputProps={{ min: 0 }}
                                                        disabled={isView}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        value={prod.store || ''}
                                                        onChange={(e) => handleProductFieldChange(idx, 'store', e.target.value)}
                                                        size="small"
                                                        disabled={isView}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {!isView && (
                                                        <IconButton color="error" onClick={() => handleRemoveProduct(idx)} disabled={isView}>
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">No products selected.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Box>
                        <TextField
                            label="PO Amount"
                            value={selectedWorkOrder.poAmount}
                            onChange={(e) => setSelectedWorkOrder({ ...selectedWorkOrder, poAmount: e.target.value })}
                            fullWidth
                            disabled={isView}
                        />
                        <TextField
                            label="Board Name"
                            value={selectedWorkOrder.boardName}
                            onChange={(e) => setSelectedWorkOrder({ ...selectedWorkOrder, boardName: e.target.value })}
                            fullWidth
                            disabled={isView}
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={selectedWorkOrder.isActive}
                                    onChange={(e) => setSelectedWorkOrder({ ...selectedWorkOrder, isActive: e.target.checked })}
                                    disabled={isView}
                                />
                            }
                            label="Active"
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color="secondary">
                        {isView ? 'Close' : 'Cancel'}
                    </Button>
                    {!isView && (
                        <Button
                            onClick={handleSave}
                            variant="contained"
                            color="primary"
                            disabled={
                                !(selectedWorkOrder.poNo || '').trim() ||
                                !(selectedWorkOrder.poDate || '').trim() ||
                                !selectedWorkOrder.partyId ||
                                !selectedWorkOrder.products.length ||
                                selectedWorkOrder.products.some(p => !p.quantity || !p.store)
                            }
                        >
                            {isEdit ? 'Update' : 'Create'}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
            {/* Product Selection Dialog */}
            <Dialog
                open={productDialogOpen}
                onClose={handleProductDialogClose}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <span>Select Products</span>
                        <TextField
                            placeholder="Search products..."
                            value={productSearch}
                            onChange={e => setProductSearch(e.target.value)}
                            size="small"
                            sx={{ ml: 2, minWidth: 250 }}
                        />
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Rate</TableCell>
                                <TableCell>Unit</TableCell>
                                <TableCell align="center"></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {productList
                                .filter(product =>
                                    product.product_name?.toLowerCase().includes(productSearch.toLowerCase()) ||
                                    product.description?.toLowerCase().includes(productSearch.toLowerCase()) ||
                                    product.unit?.toLowerCase().includes(productSearch.toLowerCase())
                                )
                                .map((product) => (
                                    <TableRow key={product.id} hover onClick={() => {
                                        const idx = selectedProducts.indexOf(product.id);
                                        if (idx > -1) {
                                            setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                                        } else {
                                            setSelectedProducts([...selectedProducts, product.id]);
                                        }
                                    }} selected={selectedProducts.includes(product.id)} style={{ cursor: 'pointer' }}>
                                        <TableCell>{product.product_name || ''}</TableCell>
                                        <TableCell>{product.description || ''}</TableCell>
                                        <TableCell>{product.rate || ''}</TableCell>
                                        <TableCell>{product.unit || ''}</TableCell>
                                        <TableCell align="center" padding="checkbox" onClick={e => e.stopPropagation()}>
                                            <Checkbox
                                                checked={selectedProducts.includes(product.id)}
                                                onChange={() => {
                                                    const idx = selectedProducts.indexOf(product.id);
                                                    if (idx > -1) {
                                                        setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                                                    } else {
                                                        setSelectedProducts([...selectedProducts, product.id]);
                                                    }
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleProductDialogClose}>Cancel</Button>
                    <Button onClick={handleProductDialogConfirm} variant="contained" disabled={!selectedProducts.length}>Add</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default WorkOrder;