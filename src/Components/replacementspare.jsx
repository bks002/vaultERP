import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControlLabel,
    Checkbox,
    Grid,
} from "@mui/material";
import axios from "axios";

const ReplacementDialog = ({ open, onClose, onSave, asset }) => {
    const [useExistingSpare, setUseExistingSpare] = useState(true);
    const [newSpare, setNewSpare] = useState({
        spareId: 0,
        spareCode: "",
        spareName: "",
        partNumber: "",
        category: "",
        specification: "",
        unitOfMeasure: "",
        currentStock: 0,
        reorderLevel: 0,
        reorderQuantity: 0,
        location: "",
        linkedAssetId: asset?.id || 0,
        vendorName: "",
        purchaseRate: 0,
        averageCost: 0,
        leadTimeDays: 0,
        criticality: "",
        warrantyExpiry: new Date().toISOString(),
        remarks: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isNew: true,
    });

    const [scrapValue, setScrapValue] = useState(0);
    const [replacementCost, setReplacementCost] = useState(0);
    const [remarks, setRemarks] = useState("");

    const handleSave = async () => {
    
        // Validate required fields
       const apiPayload = {
    SpareId: newSpare.spareId,
    SpareCode: newSpare.spareCode,
    SpareName: newSpare.spareName,
    PartNumber: newSpare.partNumber,
    Category: newSpare.category,
    Specification: newSpare.specification,
    UnitOfMeasure: newSpare.unitOfMeasure,
    CurrentStock: newSpare.currentStock,
    ReorderLevel: newSpare.reorderLevel,
    ReorderQuantity: newSpare.reorderQuantity,
    Location: newSpare.location,
    LinkedAssetId: newSpare.linkedAssetId,
    VendorName: newSpare.vendorName,
    PurchaseRate: newSpare.purchaseRate,
    AverageCost: newSpare.averageCost,
    LeadTimeDays: newSpare.leadTimeDays,
    Criticality: newSpare.criticality,
    WarrantyExpiry: newSpare.warrantyExpiry,
    Remarks: newSpare.remarks,
    CreatedAt: newSpare.createdAt,
    UpdatedAt: newSpare.updatedAt,
    IsNew: newSpare.isNew
};

    try {
        let savedSpareId = newSpare.spareId;

        if (!useExistingSpare) {
            const spareResponse = await axios.post(
                "https://admin.urest.in:8089/api/asset/AssetSpareOps/add-spare",
                apiPayload
            );
            savedSpareId = spareResponse.data.spareId;
        }

        const replacementPayload = {
            oldSpareId: asset?.spareId || 0,
            assetId: asset?.id || 0,
            useExistingSpare,
            newSpareId: savedSpareId,
            newSpare: useExistingSpare ? null : newSpare,
            scrapValue,
            replacementCost,
            netCost: replacementCost - scrapValue,
            remarks,
        };

        onSave(replacementPayload);
        onClose();
    } catch (error) {
        console.error("Error saving spare:", error);
        alert("Failed to save spare. Please check all required fields.");
    }
};

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Replacement Details</DialogTitle>
            <DialogContent dividers>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={useExistingSpare}
                            onChange={(e) => setUseExistingSpare(e.target.checked)}
                        />
                    }
                    label="Use Existing Spare"
                />

                {!useExistingSpare && (
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Spare Code"
                                value={newSpare.spareCode}
                                onChange={(e) =>
                                    setNewSpare({ ...newSpare, spareCode: e.target.value })
                                }
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Spare Name"
                                value={newSpare.spareName}
                                onChange={(e) =>
                                    setNewSpare({ ...newSpare, spareName: e.target.value })
                                }
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Part Number"
                                value={newSpare.partNumber}
                                onChange={(e) =>
                                    setNewSpare({ ...newSpare, partNumber: e.target.value })
                                }
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Category"
                                value={newSpare.category}
                                onChange={(e) =>
                                    setNewSpare({ ...newSpare, category: e.target.value })
                                }
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Specification"
                                value={newSpare.specification}
                                onChange={(e) =>
                                    setNewSpare({ ...newSpare, specification: e.target.value })
                                }
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Unit of Measure"
                                value={newSpare.unitOfMeasure}
                                onChange={(e) =>
                                    setNewSpare({ ...newSpare, unitOfMeasure: e.target.value })
                                }
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Location"
                                value={newSpare.location}
                                onChange={(e) =>
                                    setNewSpare({ ...newSpare, location: e.target.value })
                                }
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Vendor Name"
                                value={newSpare.vendorName}
                                onChange={(e) =>
                                    setNewSpare({ ...newSpare, vendorName: e.target.value })
                                }
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Purchase Rate"
                                value={newSpare.purchaseRate}
                                onChange={(e) =>
                                    setNewSpare({
                                        ...newSpare,
                                        purchaseRate: parseFloat(e.target.value) || 0,
                                    })
                                }
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Average Cost"
                                value={newSpare.averageCost}
                                onChange={(e) =>
                                    setNewSpare({
                                        ...newSpare,
                                        averageCost: parseFloat(e.target.value) || 0,
                                    })
                                }
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Lead Time (Days)"
                                value={newSpare.leadTimeDays}
                                onChange={(e) =>
                                    setNewSpare({
                                        ...newSpare,
                                        leadTimeDays: parseInt(e.target.value) || 0,
                                    })
                                }
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Criticality"
                                value={newSpare.criticality}
                                onChange={(e) =>
                                    setNewSpare({ ...newSpare, criticality: e.target.value })
                                }
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Warranty Expiry"
                                InputLabelProps={{ shrink: true }}
                                value={newSpare.warrantyExpiry.split("T")[0]}
                                onChange={(e) =>
                                    setNewSpare({ ...newSpare, warrantyExpiry: e.target.value })
                                }
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Remarks"
                                value={newSpare.remarks}
                                onChange={(e) =>
                                    setNewSpare({ ...newSpare, remarks: e.target.value })
                                }
                            />
                        </Grid>
                    </Grid>
                )}

                <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Scrap Value"
                            value={scrapValue}
                            onChange={(e) => setScrapValue(parseFloat(e.target.value) || 0)}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Replacement Cost"
                            value={replacementCost}
                            onChange={(e) =>
                                setReplacementCost(parseFloat(e.target.value) || 0)
                            }
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Remarks"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                        />
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ReplacementDialog;