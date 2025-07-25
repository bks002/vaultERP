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
    InputAdornment,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Checkbox,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSelector } from 'react-redux';

const WorkOrder = () => {
    // Example: Replace with Redux or props as needed
    const officeId = useSelector((state) => state.user.officeId);
    const userId = useSelector((state) => state.user.userId);
    const [searchQuery, setSearchQuery] = useState('');
    const [workOrders, setWorkOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedWorkOrder, setSelectedWorkOrder] = useState({
        partyId: '',
        PoNo: '',
        PoDate: '',
        product: [], // start as empty array
        // quantity: '', // remove from root
        // store: '', // remove from root
        PoAmount: '',
        boardName: '',
        isActive: true,
        officeId: officeId,
    });
    const [isEdit, setIsEdit] = useState(false);

    // Static party and product lists for demo
    const [partyList] = useState([
        { id: '1', name: 'Party A' },
        { id: '2', name: 'Party B' },
        { id: '3', name: 'Party C' },
    ]);
    const [productList] = useState([
        { id: 'p1', name: 'Product 1', description: 'Desc 1', rate: 100, unit: 'pcs' },
        { id: 'p2', name: 'Product 2', description: 'Desc 2', rate: 200, unit: 'kg' },
        { id: 'p3', name: 'Product 3', description: 'Desc 3', rate: 300, unit: 'ltr' },
    ]);
    const [productDialogOpen, setProductDialogOpen] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);

    // Placeholder for alert
    // const showAlert = (type, message) => { setAlert({ open: true, type, message }); };

    useEffect(() => {
        loadWorkOrders();
    }, []);

    const loadWorkOrders = async () => {
        setLoading(true);
        // TODO: Replace with API call
        // setWorkOrders(await fetchWorkOrders());
        setLoading(false);
    };

    const handleEdit = (workOrder) => {
        setSelectedWorkOrder({ ...workOrder });
        setIsEdit(true);
        setDialogOpen(true);
    };

    const handleDelete = async (workOrder) => {
        if (window.confirm(`Are you sure you want to delete Work Order "${workOrder.PoNo}"?`)) {
            try {
                // await deleteWorkOrder(workOrder.id);
                alert('Work Order deleted successfully!');
                loadWorkOrders();
            } catch (error) {
                alert(error.message);
            }
        }
    };

    const handleCreateNew = () => {
        setSelectedWorkOrder({
            partyId: '',
            PoNo: '',
            PoDate: '',
            product: [], // start as empty array
            // quantity: '', // remove from root
            // store: '', // remove from root
            PoAmount: '',
            boardName: '',
            isActive: true,
        });
        setIsEdit(false);
        setDialogOpen(true);
    };

    const handleSave = async () => {
        try {
            // Prepare data: isActive as 0/1, ensure each product has quantity and store
            const workOrderToSend = {
                ...selectedWorkOrder,
                isActive: selectedWorkOrder.isActive ? 1 : 0,
                product: selectedWorkOrder.product.map(p => ({
                    id: p.id,
                    quantity: p.quantity ?? '',
                    store: p.store ?? '',
                })),
                officeId: officeId,
                createdBy: userId,
                createdOn: new Date().toISOString(),
            };

            if (isEdit) {
                // await updateWorkOrder(selectedWorkOrder.id, workOrderToSend);
                alert('Work Order updated successfully!');
            } else {
                // await createWorkOrder(workOrderToSend);
                console.log(workOrderToSend);
                alert('Work Order created successfully!');
            }
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
        setProductDialogOpen(false);
    };
    const handleProductSelect = (event) => {
        const {
            target: { value },
        } = event;
        setSelectedProducts(typeof value === 'string' ? value.split(',') : value);
    };
    const handleProductDialogConfirm = () => {
        // Add selected products to work order, avoiding duplicates
        const existingIds = selectedWorkOrder.product.map((p) => p.id);
        const newProducts = productList
            .filter((p) => selectedProducts.includes(p.id) && !existingIds.includes(p.id))
            .map((p) => ({ ...p, quantity: '', store: '' })); // always add quantity and store
        setSelectedWorkOrder({
            ...selectedWorkOrder,
            product: [...selectedWorkOrder.product.filter((p) => p.id), ...newProducts],
        });
        setProductDialogOpen(false);
    };
    const handleProductFieldChange = (index, field, value) => {
        const updatedProducts = selectedWorkOrder.product.map((p, i) =>
            i === index ? { ...p, [field]: value } : p
        );
        setSelectedWorkOrder({ ...selectedWorkOrder, product: updatedProducts });
    };

    const filteredWorkOrders = workOrders.filter((wo) =>
        wo.PoNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wo.product[0]?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wo.product[0]?.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="col-12">
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h4">Work Order</Typography>
                <Box display="flex" alignItems="center" gap={2}>
                    <TextField
                        placeholder="Search by PO No, Party Name, or Contact Person"
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
                                <TableCell>Product Name</TableCell>
                                <TableCell>Quantities</TableCell>
                                <TableCell>Stores</TableCell>
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
                                        <TableCell>{wo.PoNo}</TableCell>
                                        <TableCell>{wo.PoDate}</TableCell>
                                        <TableCell>{wo.product && wo.product.length > 0 ? wo.product.map(p => p.name).join(', ') : ''}</TableCell>
                                        <TableCell>{wo.product && wo.product.length > 0 ? wo.product.map(p => p.quantity).join(', ') : ''}</TableCell>
                                        <TableCell>{wo.product && wo.product.length > 0 ? wo.product.map(p => p.store).join(', ') : ''}</TableCell>
                                        <TableCell>{wo.PoAmount}</TableCell>
                                        <TableCell>{wo.boardName}</TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Edit">
                                                <IconButton color="primary" onClick={() => handleEdit(wo)}>
                                                    <EditIcon />
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
                onClose={() => setDialogOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>{isEdit ? 'Edit Work Order' : 'Create New Work Order'}</DialogTitle>
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
                            >
                                {partyList.map((party) => (
                                    <MenuItem key={party.id} value={party.id}>{party.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        {/* PO Number, PO Date, etc. */}
                        <TextField
                            label="PO Number"
                            value={selectedWorkOrder.PoNo}
                            onChange={(e) => setSelectedWorkOrder({ ...selectedWorkOrder, PoNo: e.target.value })}
                            required
                            fullWidth
                        />
                        <TextField
                            label="PO Date"
                            type="date"
                            value={selectedWorkOrder.PoDate}
                            onChange={(e) => setSelectedWorkOrder({ ...selectedWorkOrder, PoDate: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            required
                            fullWidth
                        />
                        {/* Product Table and Add Button */}
                        <Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography variant="subtitle1">Products</Typography>
                                <Button variant="outlined" size="small" onClick={handleAddProductClick}>
                                    Add Product
                                </Button>
                            </Box>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Quantity</TableCell>
                                        <TableCell>Store</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {selectedWorkOrder.product && selectedWorkOrder.product.length > 0 ? (
                                        selectedWorkOrder.product.map((prod, idx) => (
                                            <TableRow key={prod.id || idx}>
                                                <TableCell>{prod.name}</TableCell>
                                                <TableCell>
                                                    <TextField
                                                        value={prod.quantity || ''}
                                                        onChange={(e) => handleProductFieldChange(idx, 'quantity', e.target.value)}
                                                        size="small"
                                                        type="number"
                                                        inputProps={{ min: 0 }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        value={prod.store || ''}
                                                        onChange={(e) => handleProductFieldChange(idx, 'store', e.target.value)}
                                                        size="small"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center">No products selected.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Box>
                        <TextField
                            label="PO Amount"
                            value={selectedWorkOrder.PoAmount}
                            onChange={(e) => setSelectedWorkOrder({ ...selectedWorkOrder, PoAmount: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Board Name"
                            value={selectedWorkOrder.boardName}
                            onChange={(e) => setSelectedWorkOrder({ ...selectedWorkOrder, boardName: e.target.value })}
                            fullWidth
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={selectedWorkOrder.isActive}
                                    onChange={(e) => setSelectedWorkOrder({ ...selectedWorkOrder, isActive: e.target.checked })}
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
                        disabled={
                            !selectedWorkOrder.PoNo.trim() ||
                            !selectedWorkOrder.PoDate.trim() ||
                            !selectedWorkOrder.partyId ||
                            !selectedWorkOrder.product.length ||
                            selectedWorkOrder.product.some(p => !p.quantity || !p.store)
                        }
                    >
                        {isEdit ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Product Selection Dialog */}
            <Dialog
                open={productDialogOpen}
                onClose={handleProductDialogClose}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle>Select Products</DialogTitle>
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
                            {productList.map((product) => (
                                <TableRow key={product.id} hover onClick={() => {
                                    const idx = selectedProducts.indexOf(product.id);
                                    if (idx > -1) {
                                        setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                                    } else {
                                        setSelectedProducts([...selectedProducts, product.id]);
                                    }
                                }} selected={selectedProducts.includes(product.id)} style={{ cursor: 'pointer' }}>
                                    <TableCell>{product.name || ''}</TableCell>
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