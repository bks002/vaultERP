import React, { useState, useMemo, useEffect } from "react";
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Box, Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {createPurchaseOrder} from "../../Services/InventoryService.jsx";
import {useSelector} from "react-redux";
const POQuantity = ({ open, onClose, selectedItems = [] }) => {
    const [localItems, setLocalItems] = useState([]);
    const [shippingAddress, setShippingAddress] = useState("");
    const [billingAddress, setBillingAddress] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [finalPOs, setFinalPOs] = useState([]);
    const officeId = useSelector((state) => state.user.officeId);
    useEffect(() => {
        setLocalItems(
            selectedItems.map((item) => ({
                ...item,
                quantity: item.quantity || 0,
                lineTotal: (item.quantity || 0) * item.rate,
            }))
        );
    }, [selectedItems]);

    const handleQuantityChange = (id, quantity) => {
        setLocalItems((prevItems) =>
            prevItems.map((item) =>
                item.itemId === id
                    ? { ...item, quantity, lineTotal: quantity * item.rate }
                    : item
            )
        );
    };

    const groupedPOs = useMemo(() => {
        const grouped = {};
        localItems.forEach((item) => {
            if (!grouped[item.vendorId]) {
                grouped[item.vendorId] = {
                    POId: "XXXXX",
                    Dates: new Date().toLocaleDateString(),
                    VendorId: item.vendorId,
                    VendorName: item.vendorName,
                    OfficeId: officeId,
                    CreatedBy: 0,
                    Items: [],
                    ShippingAddress: shippingAddress,
                    BillingAddress: billingAddress,
                    totalAmount: 0
                };
            }

            const itemTotal = item.quantity * item.rate;

            grouped[item.vendorId].Items.push({
                ItemId: item.itemId,
                ItemName: item.itemName,
                Rate: item.rate,
                Quantity: item.quantity,
                lineTotal:itemTotal,
                Description: item.description,
                BrandName: item.brandName,
                MeasurementUnit: item.measurementUnit,
                HSNCode: item.hsnCode,
            });

            grouped[item.vendorId].totalAmount += itemTotal;
        });

        return Object.values(grouped);
    }, [localItems, shippingAddress, billingAddress]);

    useEffect(() => {
        setFinalPOs(groupedPOs);
    }, [groupedPOs]);

    const handleRemoveVendor = (vendorId) => {
        setFinalPOs((prev) => prev.filter((po) => po.VendorId !== vendorId));
    };

    const handleCreatePO = async (finalPOs) => {
        try {
            console.log(finalPOs)
            const result = await createPurchaseOrder(finalPOs);
            console.log("Purchase Orders Created:", result);
            alert("Purchase Orders Created Successfully!");
            setDialogOpen(false);
            onClose();
        } catch (error) {
            console.error(error);
            alert("Error creating Purchase Orders. Please try again.");
        }finally {
            setBillingAddress("");
            setShippingAddress("");
        }
    };


    const columns = [
        { field: "itemName", headerName: "Item Name", flex: 1 },
        { field: "description", headerName: "Description", flex: 1 },
        { field: "vendorName", headerName: "Vendor", flex: 1 },
        { field: "rate", headerName: "Price", flex: 1 },
        {
            field: "quantity",
            headerName: "Quantity",
            renderCell: (params) => (
                <TextField
                    type="number"
                    size="small"
                    value={params.row.quantity}
                    onChange={(e) =>
                        handleQuantityChange(params.row.itemId, Number(e.target.value))
                    }
                />
            ),
        },
        { field: "lineTotal", headerName: "Total Amount", flex: 1 },
    ];

    if (!open) return null;

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
                <DialogTitle>Purchase Order Cart</DialogTitle>
                <DialogContent>
                    <Box display="flex" justifyContent="space-between" gap={2} my={2}>
                        <TextField
                            label="Shipping Address"
                            fullWidth
                            value={shippingAddress}
                            onChange={(e) => setShippingAddress(e.target.value)}
                        />
                        <TextField
                            label="Billing Address"
                            fullWidth
                            value={billingAddress}
                            onChange={(e) => setBillingAddress(e.target.value)}
                        />
                    </Box>
                    <DataGrid
                        rows={localItems}
                        columns={columns}
                        getRowId={(row) => row.itemId}
                        autoHeight
                    />
                </DialogContent>
                <DialogActions>
                    <Button variant="text" color="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setDialogOpen(true)}
                    >
                        Got to cart
                    </Button>
                </DialogActions>
            </Dialog>
            {dialogOpen &&
            <PoPreview
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                finalPOs={finalPOs}
                onRemoveVendor={handleRemoveVendor}
                onConfirm={handleCreatePO}
            />}
        </>
    );
};

export default POQuantity;

const PoPreview = ({ open, onClose, finalPOs, onRemoveVendor, onConfirm }) => {
    if (!open) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>Preview Purchase Orders</DialogTitle>
            <DialogContent>
                {finalPOs.map((po) => (
                    <Box key={po.VendorId} mt={2}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6">Vendor: {po.VendorName}</Typography>
                            <Button variant="text" color="error" onClick={() => onRemoveVendor(po.VendorId)}>
                                ❌ Remove
                            </Button>
                        </Box>
                        {po.Items.map((item) => (
                            <Typography key={item.ItemId}>
                                {item.ItemName} - Qty: {item.Quantity} - Price: ₹{item.Rate} - Total: ₹{item.lineTotal}
                            </Typography>
                        ))}
                        <Typography variant="body2">Ship To: {po.ShippingAddress}</Typography>
                        <Typography variant="body2">Bill To: {po.BillingAddress}</Typography>
                    </Box>
                ))}
            </DialogContent>
            <DialogActions>
                <Button variant="text" color="secondary" onClick={onClose}>
                    Back
                </Button>
                <Button variant="contained" color="primary" onClick={() => onConfirm(finalPOs)}>
                    Confirm & Create All POs
                </Button>
            </DialogActions>
        </Dialog>
    );
};
