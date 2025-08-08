import React, { useEffect, useState } from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableRow, TableContainer, IconButton,
    Paper, Typography, Tooltip, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Stack, InputAdornment, Checkbox
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import ViewIcon from '@mui/icons-material/Visibility';
import { useSelector } from 'react-redux';
import { getProductMasters } from "../../Services/ProductMasterService";
import { getPartyMasters } from '../../Services/PartyMasterService';
import { getWorkOrders, createWorkOrder, deleteWorkOrder } from '../../Services/WorkOrderService';
import ExportCSVButton from '../../Components/Export to CSV/ExportCSVButton';


const WorkOrderMilestone = () => {
    const todayDate = new Date().toISOString().split('T')[0];
    const officeId = useSelector((state) => state.user.officeId);
    const userId = useSelector((state) => state.user.userId);

    const [searchQuery, setSearchQuery] = useState('');
    const [workOrders, setWorkOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedWorkOrder, setSelectedWorkOrder] = useState({
        milestone: '',
        partyName: '',
        target: '',
        targetDate: '',
        deliveryDate: '',
        boardName: '',
        totalDeliverable: 0,
    });
    const [isEdit, setIsEdit] = useState(false);
    const [isView, setIsView] = useState(false);
    const [partyList, setPartyList] = useState([]);
    const [productList, setProductList] = useState([]);
   

    useEffect(() => {
        if (officeId) {
            loadWorkOrders();
            fetchPartyList();
            fetchProductList();
        }
    }, [officeId]);

    const loadWorkOrders = async () => {
        setLoading(true);
        const data = await getWorkOrders(officeId);
        setWorkOrders(data);
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

   const handleView = (workOrder) => {
    setSelectedWorkOrder({
        Milestone: workOrder.milestone || '',
        PartyName: workOrder.partyName || '',
        Target: workOrder.target || '',
        TargetDate: workOrder.targetDate ? workOrder.targetDate.split('T')[0] : '',
        DeliveryDate: workOrder.deliveryDate ? workOrder.deliveryDate.split('T')[0] : '',
        TotalDeliverable: workOrder.totalDeliverable ?? '-'
    });

    setIsEdit(false);
    setIsView(true);
    setDialogOpen(true);
};


    const handleEdit = (workOrder) => {
        const enrichedProducts = workOrder.products?.map(p => {
            const fullProduct = productList.find(prod => String(prod.id) === String(p.productId));
            return {
                ...p,
                productName: fullProduct?.product_name || ''
            };
        }) || [];

        setSelectedWorkOrder({
            ...workOrder,
            products: enrichedProducts
        });

        setIsEdit(true);
        setIsView(false);
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

    const handleSave = async () => {
        try {
            const workOrderToSend = {
                ...selectedWorkOrder,
                isActive: selectedWorkOrder.isActive ? 1 : 0,
                products: selectedWorkOrder.products.map(p => ({
                    productId: p.productId,
                    quantity: p.quantity ?? '',
                    store: p.store ?? '',
                })),
                officeId: officeId,
                createdBy: userId,
                createdOn: new Date().toISOString(),
            };
            await createWorkOrder(workOrderToSend);
            alert('Work Order saved successfully!');
            setDialogOpen(false);
            loadWorkOrders();
        } catch (error) {
            alert(error.message);
        }
    };

    

    const handleDialogClose = () => {
        setDialogOpen(false);
        setIsView(false);
        setIsEdit(false);
    };

    const filteredWorkOrders = workOrders.filter((wo) =>
        wo.poNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wo.partyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wo.boardName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const csvData = filteredWorkOrders.map(order => ({
        poNo: order.poNo,
        poDate: order.poDate?.split('T')[0] || '',
        poAmount: order.poAmount,
        boardName: order.boardName,
        partyName: order.partyName,
        deliveryDate: order.deliveryDate?.split('T')[0] || '',
        totalDeliverable: order.totalDeliverable,
        productNames: order.products?.map(p => {
            const prod = productList.find(prod => String(prod.id) === String(p.productId));
            return prod?.product_name || '';
        }).join(', ') || '',
        quantity: order.products?.map(p => p.quantity || '').join(', ') || '',
        store: order.products?.map(p => p.store || '').join(', ') || ''
    }));

    const csvHeaders = [
        { label: "PO No", key: "poNo" },
        { label: "PO Date", key: "poDate" },
        { label: "PO Amount", key: "poAmount" },
        { label: "Board Name", key: "boardName" },
        { label: "Party Name", key: "partyName" },
        { label: "Delivery Date", key: "deliveryDate" },
        { label: "Total Deliverable", key: "totalDeliverable" },
        { label: "Product Names", key: "productNames" },
        { label: "Quantity", key: "quantity" },
        { label: "Store", key: "store" }
    ];

    return (
        <div className="col-12">
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h4">Work Orders Milestone</Typography>
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
                    <ExportCSVButton
                        data={csvData}
                        filename="WorkOrders.csv"
                        headers={csvHeaders}
                    />
                </Box>
            </Box>

            {loading && <Typography>Loading data...</Typography>}

            {!loading && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>Milestone</TableCell>
                                <TableCell>Party Name</TableCell>
                                <TableCell>Target</TableCell>
                                <TableCell>Target Date</TableCell>
                                <TableCell>Delivery Date</TableCell>
                                <TableCell>Total Deliverables</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredWorkOrders.length > 0 ? (
                                filteredWorkOrders.map((wo, index) => (
                                    <TableRow key={wo.id || index}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{wo.milestone}</TableCell>
                                        <TableCell>{wo.partyName}</TableCell>
                                        <TableCell>{wo.target}</TableCell>
                                        <TableCell>{wo.targetDate ? wo.targetDate.split('T')[0] : '-'}</TableCell>
                                        <TableCell>{wo.deliveryDate ? wo.deliveryDate.split('T')[0] : '-'}</TableCell>
                                        <TableCell>{wo.totalDeliverable ?? '-'}</TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Edit">
                                                <IconButton color="primary" onClick={() => handleEdit(wo)}>
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
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
                                    <TableCell colSpan={8} align="center">
                                        No Work Order Milestone found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Milestone Dialog */}
           {/* Edit/View Dialog */}
<Dialog open={dialogOpen} onClose={handleDialogClose} fullWidth maxWidth="sm">
    <DialogTitle>
        {isEdit ? "Edit Work Order" : "View Work Order Milestone"}
    </DialogTitle>
    <DialogContent dividers>
        {isEdit ? (
            <>
                <TextField
                    fullWidth
                    label="Milestone ID"
                    margin="dense"
                    value={selectedWorkOrder.milestone || ""}
                    onChange={(e) =>
                        setSelectedWorkOrder({
                            ...selectedWorkOrder,
                            milestone: e.target.value
                        })
                    }
                />
                
                <TextField
                    fullWidth
                    label="Target"
                    margin="dense"
                    value={selectedWorkOrder.target || ""}
                    onChange={(e) =>
                        setSelectedWorkOrder({
                            ...selectedWorkOrder,
                            target: e.target.value
                        })
                    }
                />
                <TextField
                    fullWidth
                    type="date"
                    label="Target Date"
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                    value={selectedWorkOrder.targetDate || ""}
                    onChange={(e) =>
                        setSelectedWorkOrder({
                            ...selectedWorkOrder,
                            targetDate: e.target.value
                        })
                    }
                />
                
            </>
        ) : (
            <Table>
                <TableBody>
                    {Object.entries(selectedWorkOrder).map(([key, value]) => (
                        <TableRow key={key}>
                            <TableCell><b>{key}</b></TableCell>
                            <TableCell>{String(value)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        )}
    </DialogContent>
    <DialogActions>
        {isEdit ? (
            <>
                <Button onClick={handleDialogClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained" color="primary">
                    Save
                </Button>
            </>
        ) : (
            <Button onClick={handleDialogClose}>Close</Button>
        )}
    </DialogActions>
</Dialog>


        </div>
    );
};

export default WorkOrderMilestone;
