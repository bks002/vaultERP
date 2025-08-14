import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import { getAllAssets, getServiceDates } from "../../Services/AssetService";
import { saveServiceRecord, getServiceHistory } from "../../Services/AssetServiceRecord";
import { useSelector } from "react-redux";

export default function ServicePage() {
    const [passedServices, setPassedServices] = useState([]);
    const [upcomingServices, setUpcomingServices] = useState([]);
    const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [serviceHistory, setServiceHistory] = useState([]);
    const [selectedAsset, setSelectedAsset] = useState(null);

    const [newRecord, setNewRecord] = useState({
        assetId: 0,
        serviceDate: "",
        nextServiceDate: "",
        remark: "",
        serviceCost: "",
        servicedBy: "",
        approvedBy: "",
        imageFile: null,
        receiptFile: null
    });

    const officeId = useSelector((state) => state.user.officeId);
    const userId = useSelector((state) => state.user.userId);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getServiceDates(officeId);
                setPassedServices(res.passedServiceDates || []);
                setUpcomingServices(res.upcomingServiceDates || []);
            } catch (error) {
                console.error("Failed to fetch service dates", error);
            }
        };
        fetchData();
    }, [officeId]);

    const handleViewHistory = async (assetId) => {
        try {
            const history = await getServiceHistory(assetId);
            setServiceHistory(history || []);
            setSelectedAsset(assetId);
            setHistoryDialogOpen(true);
        } catch (error) {
            console.error("Failed to fetch service history", error);
        }
    };

    const handleOpenAddDialog = (assetId) => {
        setNewRecord({
            assetId,
            serviceDate: "",
            nextServiceDate: "",
            remark: "",
            serviceCost: "",
            servicedBy: "",
            approvedBy: "",
            imageFile: null,
            receiptFile: null
        });
        setSelectedAsset(assetId);
        setAddDialogOpen(true);
    };

    const handleSaveRecord = async () => {
        try {
            const formData = new FormData();
            formData.append("id", 0);
            formData.append("assetId", newRecord.assetId);
            formData.append("serviceDate", newRecord.serviceDate);
            formData.append("nextServiceDate", newRecord.nextServiceDate);
            formData.append("remark", newRecord.remark);
            formData.append("serviceCost", newRecord.serviceCost || 0);
            formData.append("servicedBy", newRecord.servicedBy);
            formData.append("approvedBy", newRecord.approvedBy);
            formData.append("createdBy", userId);

            if (newRecord.imageFile) {
                formData.append("image", newRecord.imageFile);
            }
            if (newRecord.receiptFile) {
                formData.append("serviceDoc", newRecord.receiptFile);
            }

            await saveServiceRecord(formData);
            setAddDialogOpen(false);
            await getServiceDates(officeId);
        } catch (error) {
            console.error("Failed to save service record", error);
        }
    };

    const openDocument = (base64Data) => {
  if (!base64Data) return;

  // Decode base64 string, create byte array
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);

  // Create blob from byte array
  const blob = new Blob([byteArray], { type: 'application/pdf' });

  // Create URL for blob
  const blobUrl = URL.createObjectURL(blob);

  // Open URL in new tab
  window.open(blobUrl, '_blank');

  // Optionally revoke the URL after some time to free memory
  setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
};


    const renderTable = (title, rows, bgColor) => (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                {title}
            </Typography>
            <TableContainer component={Paper} sx={{ backgroundColor: bgColor }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><b>Id</b></TableCell>
                            <TableCell><b>Name</b></TableCell>
                            <TableCell><b>Service Due Date</b></TableCell>
                            <TableCell><b>Actions</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow key={row.assetId}>
                                <TableCell>{row.assetId}</TableCell>
                                <TableCell>{row.assetName}</TableCell>
                                <TableCell>
                                    {row.nextServiceDate
                                        ? new Date(row.nextServiceDate).toISOString().split("T")[0]
                                        : "N/A"}
                                </TableCell>
                                <TableCell>
                                    <IconButton color="primary" onClick={() => handleViewHistory(row.assetId)}>
                                        <VisibilityIcon />
                                    </IconButton>
                                    <IconButton color="success" onClick={() => handleOpenAddDialog(row.assetId)}>
                                        <AddIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {rows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    No data available
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );

    return (
        <Box sx={{ p: 3 }}>
            {renderTable("Service Over Due Assets", passedServices, "#f8d7da")}
            {renderTable("Upcoming Services", upcomingServices, "#fff3cd")}

            {/* Service History Dialog */}
            <Dialog open={historyDialogOpen} onClose={() => setHistoryDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Service History - Asset {selectedAsset}</DialogTitle>
                <DialogContent dividers>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Next Service</TableCell>
                                <TableCell>Remark</TableCell>
                                <TableCell>Cost</TableCell>
                                <TableCell>Serviced By</TableCell>
                                <TableCell>Approved By</TableCell>
                                <TableCell>Image</TableCell>
                                <TableCell>Document</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {serviceHistory.map((rec) => (
                                <TableRow key={rec.id}>
                                    <TableCell>{rec.serviceDate}</TableCell>
                                    <TableCell>{rec.nextServiceDate}</TableCell>
                                    <TableCell>{rec.remark || "-"}</TableCell>
                                    <TableCell>{rec.serviceCost}</TableCell>
                                    <TableCell>{rec.servicedBy || "-"}</TableCell>
                                    <TableCell>{rec.approvedBy || "-"}</TableCell>

                                    <TableCell>
                                        {rec.image ? (
                                            <img
                                                src={`data:image/jpeg;base64,${rec.image}`}
                                                alt="Service"
                                                style={{ maxWidth: 100, cursor: "pointer" }}
                                                onClick={() => window.open(`data:image/jpeg;base64,${rec.image}`, "_blank")}
                                            />
                                        ) : "-"}
                                    </TableCell>

                                    <TableCell>
                                        {rec.serviceDoc ? (
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => openDocument(rec.serviceDoc)}
                                            >
                                                View Doc
                                            </Button>
                                        ) : "-"}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setHistoryDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Add Service Record Dialog */}
            <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Service Record - Asset {selectedAsset}</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        label="Service Date"
                        type="date"
                        fullWidth
                        value={newRecord.serviceDate}
                        onChange={(e) => setNewRecord({ ...newRecord, serviceDate: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="Next Service Date"
                        type="date"
                        fullWidth
                        value={newRecord.nextServiceDate}
                        onChange={(e) => setNewRecord({ ...newRecord, nextServiceDate: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="Remark"
                        fullWidth
                        value={newRecord.remark}
                        onChange={(e) => setNewRecord({ ...newRecord, remark: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="Service Cost"
                        type="number"
                        fullWidth
                        value={newRecord.serviceCost}
                        onChange={(e) => setNewRecord({ ...newRecord, serviceCost: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="Serviced By"
                        fullWidth
                        value={newRecord.servicedBy}
                        onChange={(e) => setNewRecord({ ...newRecord, servicedBy: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="Approved By"
                        fullWidth
                        value={newRecord.approvedBy}
                        onChange={(e) => setNewRecord({ ...newRecord, approvedBy: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Upload Image
                    </Typography>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setNewRecord({ ...newRecord, imageFile: e.target.files[0] })}
                        style={{ marginBottom: 20 }}
                    />

                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Upload Service Receipt
                    </Typography>
                    <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => setNewRecord({ ...newRecord, receiptFile: e.target.files[0] })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveRecord}>Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
