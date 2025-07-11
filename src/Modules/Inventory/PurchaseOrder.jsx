import React, { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TableContainer,
    Paper,
    Typography,
    IconButton,
    Button,
    Box,
    Tooltip,
    CircularProgress, DialogActions, Dialog, DialogContent, DialogTitle,
    TextField, 
    InputAdornment,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PrintIcon from '@mui/icons-material/Print';
import { useSelector } from 'react-redux';
import { getPurchaseOrder } from '../../Services/InventoryService.jsx';
import CreatePurchaseOrder from "./CreatePurchseOrder.jsx";
import SearchIcon from '@mui/icons-material/Search';

const PurchaseOrder = () => {
    const officeId = useSelector((state) => state.user.officeId);
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [printDialogOpen, setPrintDialogOpen] = useState(false);
    const [selectedPO, setSelectedPO] = useState(null);
    const [searchQuery, setSearchQuery] = useState(''); 


    const loadPurchaseOrders = async () => {
        console.log('Loading Purchase Orders for Office ID:', officeId);
        setLoading(true);

        try {
            const data = await getPurchaseOrder(officeId);
            setPurchaseOrders(data || []);
        } catch (error) {
            console.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (officeId > 0) loadPurchaseOrders();
    }, [officeId]);
        const filteredPOs = purchaseOrders.filter(po =>
        po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.vendorName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return (
        <div className="col-12">
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h4">Purchase Orders</Typography>
                <Box display="flex" alignItems="center" gap={2}>
                    {/* ✅ Search Bar */}
                    <TextField
                        placeholder="Search PO Number or Vendor..."
                        variant="outlined"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ width: 300 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            )
                        }}
                    />
                    <Button variant="contained" color="primary" onClick={() => setCreateDialogOpen(true)}>
                        Create New Purchase Order
                    </Button>
                </Box>
            </Box>

            {loading && <CircularProgress />}

            {!loading && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>PO Number</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Vendor Name</TableCell>
                                {/*<TableCell>Total Amount</TableCell>*/}
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredPOs.length > 0 ? (
                                filteredPOs.map((po, index) => (
                                    <TableRow key={po.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{po.poNumber}</TableCell>
                                        <TableCell>{new Date(po.poDateTime).toLocaleString()}</TableCell>
                                        <TableCell>{po.vendorName}</TableCell>
                                        {/*<TableCell>₹{po.totalAmount}</TableCell>*/}
                                        <TableCell align="center">
                                            <Tooltip title="View">
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => {
                                                        setSelectedPO(po);
                                                        setViewDialogOpen(true);
                                                    }}
                                                >
                                                    <VisibilityIcon />
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip title="Print">
                                                <IconButton
                                                    color="secondary"
                                                    onClick={() => {
                                                        setSelectedPO(po);
                                                        setPrintDialogOpen(true);
                                                    }}
                                                >
                                                    <PrintIcon />
                                                </IconButton>
                                            </Tooltip>

                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        No Purchase Orders found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>

                    </Table>
                </TableContainer>
            )}

            {/** Modal for creating a new Purchase Order */}
            <CreatePurchaseOrder
                open={createDialogOpen}
                onClose={() => {
                    setCreateDialogOpen(false);
                    loadPurchaseOrders();
                }}
                officeId={officeId}
            />

            {/* View PO Modal */}
            <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>View Purchase Order</DialogTitle>
                <DialogContent dividers>
                    {selectedPO ? (
                        <Box>
                            <Typography variant="h6">PO Number: {selectedPO.poNumber}</Typography>
                            <Typography variant="body1">Date: {new Date(selectedPO.poDateTime).toLocaleString()}</Typography>
                            <Typography variant="body1">Vendor: {selectedPO.vendorName}</Typography>
                            <Typography variant="body1">Shipping: {selectedPO.shippingAddress}</Typography>
                            <Typography variant="body1">Billing: {selectedPO.billingAddress}</Typography>
                            <Typography variant="body1" mt={2}>Items:</Typography>
                            <ul>
                                {selectedPO.items?.map((item, idx) => (
                                    <li key={idx}>
                                        {item.itemName} - Qty: {item.quantity}, Rate: ₹{item.rate}, Total: ₹{item.lineTotal}
                                    </li>
                                ))}
                            </ul>
                        </Box>
                    ) : (
                        <Typography>No data available.</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewDialogOpen(false)} color="primary">Close</Button>
                </DialogActions>
            </Dialog>

            {/* Print PO Modal */}
            <Dialog open={printDialogOpen} onClose={() => setPrintDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Print Purchase Order</DialogTitle>
                <DialogContent dividers>
                    {selectedPO ? (
                        <Box>
                            <Typography variant="h6">Purchase Order - {selectedPO.poNumber}</Typography>
                            <Typography>Date: {new Date(selectedPO.poDateTime).toLocaleString()}</Typography>
                            <Typography>Vendor: {selectedPO.vendorName}</Typography>
                            <Typography>Shipping: {selectedPO.shippingAddress}</Typography>
                            <Typography>Billing: {selectedPO.billingAddress}</Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Item</TableCell>
                                        <TableCell>Qty</TableCell>
                                        <TableCell>Rate</TableCell>
                                        <TableCell>Total</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {selectedPO.items?.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{item.itemName}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell>₹{item.rate}</TableCell>
                                            <TableCell>₹{item.lineTotal}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    ) : (
                        <Typography>No data available.</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => window.print()} color="primary">Print</Button>
                    <Button onClick={() => setPrintDialogOpen(false)} color="secondary">Close</Button>
                </DialogActions>
            </Dialog>


        </div>
    );
};

export default PurchaseOrder;
