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
    
    TextField, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel,MenuItem
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import { getAllAssets, getServiceDates } from "../../Services/AssetService";
import { saveServiceRecord, getServiceHistory,  approveOrRejectServiceRecord, } from "../../Services/AssetServiceRecord";
import { getAllEmployees } from "../../Services/EmployeeService";
import { useSelector } from "react-redux";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

export default function ServicePage() {
    const [passedServices, setPassedServices] = useState([]);
    const [upcomingServices, setUpcomingServices] = useState([]);
    const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [serviceHistory, setServiceHistory] = useState([]);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [serviceType, setServiceType] = useState("Paid"); // default Paid
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectRemark, setRejectRemark] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
    const getTodayDate = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    };

    const [newRecord, setNewRecord] = useState({
        assetId: 0,
        serviceDate: getTodayDate(),
        nextServiceDate: "",
        remark: "",
        serviceCost: "",
        servicedBy: "",
        approvedBy: "",
        imageFile: null,
        receiptFile: null,
        Days:"",
        Duration:"", 
    });

    const officeId = useSelector((state) => state.user.officeId);
    const userId = useSelector((state) => state.user.userId);
    const [employees, setEmployees] = useState([]);

useEffect(() => {
    const fetchEmployees = async () => {
        try {
            const res = await getAllEmployees(officeId); // you should have a service for this
            setEmployees(res || []);
        } catch (err) {
            console.error("Failed to fetch employees", err);
        }
    };
    fetchEmployees();
}, [officeId]);


 const handleApprove = async (record) => {
  try {
    const payload = {
      recordId: record.recordId ?? record.id,
      isApproved: true,
      isRejected: false,
      rejectionRemark: "",
      approvedBy: record.approvedBy ?? newRecord.approvedBy, // 👈 dropdown se
    };

    await approveOrRejectServiceRecord(payload);

    setServiceHistory((prev) =>
      prev.map((r) =>
        (r.recordId ?? r.id) === (record.recordId ?? record.id)
          ? { ...r, status: "Approved", approvedBy: payload.approvedBy }
          : r
      )
    );
  } catch (error) {
    console.error("Approve failed", error);
  }
};

const handleRejectSave = async () => {
  if (!selectedRecord) return;
  try {
    const payload = {
      recordId: selectedRecord.recordId ?? selectedRecord.id,
      isApproved: false,
      isRejected: true,
      rejectionRemark: rejectRemark || "Rejected",
      approvedBy: selectedRecord.approvedBy ?? newRecord.approvedBy, // 👈 dropdown se
    };

    await approveOrRejectServiceRecord(payload);

    setServiceHistory((prev) =>
      prev.map((r) =>
        (r.recordId ?? r.id) === (selectedRecord.recordId ?? selectedRecord.id)
          ? { ...r, status: payload.rejectionRemark, approvedBy: payload.approvedBy }
          : r
      )
    );

    setRejectDialogOpen(false);
  } catch (error) {
    console.error("Reject failed", error);
  }
};


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
            serviceDate: getTodayDate(),
            nextServiceDate: "",
            remark: "",
            serviceCost: "",
            servicedBy: "",
            approvedBy: "",
            Days:"",
            Duration:"",
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
            
             // 👇 Yaha duration fields add karo
               if (newRecord.Days !== undefined) {
                formData.append("Days", newRecord.Days || 0);
                }
                if (newRecord.Duration) {
                formData.append("Duration", newRecord.Duration); // HH:MM string
                }
            if (newRecord.imageFile) {
                formData.append("image", newRecord.imageFile);
            }
            if (newRecord.receiptFile) {
                formData.append("serviceDoc", newRecord.receiptFile);
            }

            await saveServiceRecord(formData);
            setAddDialogOpen(false);
            const res = await getServiceDates(officeId);
        setPassedServices(res.passedServiceDates || []);
        setUpcomingServices(res.upcomingServiceDates || []);

        // Reset newRecord if needed
        setNewRecord({
            assetId: 0,
            serviceDate: getTodayDate(),
            nextServiceDate: "",
            remark: "",
            serviceCost: "",
            servicedBy: "",
            approvedBy: "",
            Days:"",
            Duration:"",
            imageFile: null,
            receiptFile: null
        });
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
                                <TableCell>Days</TableCell>
                                <TableCell>Duration</TableCell>
                                <TableCell>Approved By</TableCell>
                                <TableCell>Image</TableCell>
                                <TableCell>Document</TableCell>
                                 <TableCell>Status</TableCell>
                                 <TableCell>Actions</TableCell>
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
                                    <TableCell>{rec.days || "-"}</TableCell>
                                    <TableCell>{rec.duration || "-"}</TableCell>
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
                                    <TableCell>
                                        {rec.isApproved ? (
                                            <Box
                                            sx={{
                                                display: "inline-block",
                                                px: 1.5,
                                                py: 0.5,
                                                borderRadius: "12px",
                                                bgcolor: "#d4edda",
                                                color: "#155724",
                                                fontWeight: "bold",
                                                fontSize: "0.8rem",
                                            }}
                                            >
                                            Approved
                                            </Box>
                                        ) : rec.isRejected ? (
                                            <Box
                                            sx={{
                                                display: "inline-block",
                                                px: 1.5,
                                                py: 0.5,
                                                borderRadius: "12px",
                                                bgcolor: "#f8d7da",
                                                color: "#721c24",
                                                fontWeight: "bold",
                                                fontSize: "0.8rem",
                                            }}
                                            >
                                            {`Rejected (${rec.rejectionRemark || "No remark"})`}
                                            </Box>
                                        ) : (
                                            <Box
                                            sx={{
                                                display: "inline-block",
                                                px: 1.5,
                                                py: 0.5,
                                                borderRadius: "12px",
                                                bgcolor: "#e2e3e5",
                                                color: "#383d41",
                                                fontWeight: "bold",
                                                fontSize: "0.8rem",
                                            }}
                                            >
                                            {rec.status || "Pending"}
                                            </Box>
                                        )}
                                        </TableCell>


                                    <TableCell>
                                        <IconButton
                                            color="success"
                                            onClick={() => handleApprove(rec)}
                                            title="Approve"
                                        >
                                            <CheckIcon />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                             onClick={() => {
    setSelectedRecord(rec);   // store record here
    setRejectDialogOpen(true); // open dialog properly
  }}
                                            title="Reject"
                                        >
                                            <CloseIcon />
                                        </IconButton>
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

             {/* Reject Remark Dialog */}
            <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Reject Service Record</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Rejection Remark"
                        multiline
                        rows={4}
                        fullWidth
                        value={rejectRemark}
                        onChange={(e) => setRejectRemark(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleRejectSave}>Save</Button>
                </DialogActions>
            </Dialog>

            {/* Add Service Record Dialog */}
            <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Service Record - Asset {selectedAsset}</DialogTitle>
                <DialogContent dividers>
                    <FormControl component="fieldset" sx={{ mb: 2 }}>
                        <FormLabel component="legend">Service Type</FormLabel>
                        <RadioGroup
                            row
                            value={serviceType}
                            onChange={(e) => {
                                const value = e.target.value;
                                setServiceType(value);
                                if (value === "Free") {
                                    setNewRecord({ ...newRecord, serviceCost: 0 });
                                }
                            }}
                        >
                            <FormControlLabel value="Free" control={<Radio />} label="Free" />
                            <FormControlLabel value="Paid" control={<Radio />} label="Paid" />
                        </RadioGroup>
                    </FormControl>
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
                 <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
  {/* Days Field */}
  <TextField
    label="Duration (Days)"
    type="number"
    sx={{ flex: 1 }}
    value={newRecord.Days ?? ""}
    onChange={(e) => {
      const days = e.target.value === "" ? "" : parseInt(e.target.value, 10);
      const serviceDate = new Date(newRecord.serviceDate);
      const nextDate = new Date(serviceDate);

      if (days !== "") {
        nextDate.setDate(nextDate.getDate() + days);
      }

      if (newRecord.Duration) {
        const [h, m] = newRecord.Duration.split(":").map(Number);
        nextDate.setHours(nextDate.getHours() + (h || 0));
        nextDate.setMinutes(nextDate.getMinutes() + (m || 0));
      }

      setNewRecord({
        ...newRecord,
        Days: days,
        nextServiceDate: nextDate.toISOString().slice(0, 16),
      });
    }}
  />

  {/* Hours & Minutes in 24h format */}
  <Box sx={{ flex: 1 }}>
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <TimePicker
        label="Duration (HH:MM)"
        ampm={false}
        value={
          newRecord.Duration
            ? new Date(`1970-01-01T${newRecord.Duration}:00`)
            : null
        }
        onChange={(newValue) => {
          if (!newValue) return;
          const hours = newValue.getHours();
          const minutes = newValue.getMinutes();

          const serviceDate = new Date(newRecord.serviceDate);
          const nextDate = new Date(serviceDate);
          if (newRecord.Days) {
            nextDate.setDate(nextDate.getDate() + newRecord.Days);
          }
          nextDate.setHours(nextDate.getHours() + hours);
          nextDate.setMinutes(nextDate.getMinutes() + minutes);

          setNewRecord({
            ...newRecord,
            Duration: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
            nextServiceDate: nextDate.toISOString().slice(0, 16),
          });
        }}
        renderInput={(params) => <TextField {...params} fullWidth />}
      />
    </LocalizationProvider>
  </Box>
</Box>







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
                        disabled={serviceType === "Free"}
                    />
                    <TextField
                        label="Serviced By"
                        fullWidth
                        value={newRecord.servicedBy}
                        onChange={(e) => setNewRecord({ ...newRecord, servicedBy: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                   <TextField
  select 
  label="Approved By"
  fullWidth
  value={newRecord.approvedBy}
  onChange={(e) => setNewRecord({ ...newRecord, approvedBy: Number(e.target.value) })}
  sx={{ mb: 2 }}
>
  <MenuItem value="">
    <em>None</em>
  </MenuItem>
  {employees.map((employee) => (
    <MenuItem key={employee.employeeId} value={employee.employeeId}>
      {employee.employeeName}
    </MenuItem>
  ))}
</TextField>

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
