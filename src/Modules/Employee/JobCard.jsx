"use client";
import React, { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import {
  Container, Typography, Grid, TextField, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  MenuItem, Table, TableBody, TableCell, TableContainer, TableHead,

  TableRow, InputAdornment, IconButton, Tooltip, Stack, Paper, FormControl,

  FormLabel, RadioGroup, FormControlLabel, Radio,
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useSelector } from "react-redux";

import AlertSnackbar from "../../Components/Alert/AlertSnackBar";
import { getAllAssets } from "../../Services/AssetService";
import { getAllOperation } from "../../Services/OperationService";
import { getAllShift } from "../../Services/ShiftService";
import {
  getJobCards,
  createJobCard,
  updateJobCard,
  deleteJobCard
} from "../../Services/JobCard";

import ExportCSVButton from "../../Components/Export to CSV/ExportCSVButton";

const JobCard = () => {
  const officeId = useSelector((state) => state.user.officeId);
  const userId = useSelector((state) => state.user.userId);

  const [jobCards, setJobCards] = useState([]);
  const [assets, setAssets] = useState([]);
  const [operations, setOperations] = useState([]);
  const [shift, setShift] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [alert, setAlert] = useState({ open: false, type: "success", message: "" });

  const defaultFormData = {
    id: "",
    orderNo: "",
    isCode: "",
    date: "",
    assetId: "",
    shiftId: "",
    operationId: "",
    size: 0,
    noDiaOfStands: "",
    shape: "",
    isCompacted: "",
    compound: "",
    color: "",
    thickness: "",
    length: "",
    noDiaOfAmWire: "",
    payOffDno: "",
    takeUpDrumSize: "",
    embrossing: "",
    remark: "",
    createdBy: userId,
    officeId: officeId,
    createdOn: "",

    updatedBy: userId,
    updatedOn: "",
  };

  const [formData, setFormData] = useState(defaultFormData);

  const showAlert = (type, message) => {
    setAlert({ open: true, type, message });
  };

  useEffect(() => {
    if (officeId) {
      fetchJobCardData();
      loadAllAssets();
      loadAllOperations();
      loadAllShift();
    }
  }, [officeId]);

  const fetchJobCardData = async () => {
    try {
      const data = await getJobCards(officeId);
      setJobCards(data);
    } catch {
      showAlert("error", "Failed to load job cards");
    }
  };

  const loadAllAssets = async () => {
    try {
      const data = await getAllAssets(officeId);
      setAssets(data);
    } catch {
      showAlert("error", "Failed to load assets");
    }
  };

  const loadAllOperations = async () => {
    try {
      const data = await getAllOperation(officeId);
      setOperations(data);
    } catch {
      showAlert("error", "Failed to load operations");
    }
  };

  const loadAllShift = async () => {
    try {
      const data = await getAllShift(officeId);
      setShift(data);
    } catch {
      showAlert("error", "Failed to load shifts");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreate = () => {
    setIsEdit(false);
    setFormData(defaultFormData);
    setDialogOpen(true);
  };


  const populateFormData = (job) => ({

    id: job.id,
    orderNo: job.orderNo,
    isCode: job.isCode,
    date: job.date,
    assetId: job.assetId,
    shiftId: job.shiftId,
    operationId: job.operationId,
    size: job.size,
    noDiaOfStands: job.noDiaOfStands,
    shape: job.shape,
    isCompacted: job.isCompacted ? "yes" : "no",
    compound: job.compound,
    color: job.color,
    thickness: job.thickness,
    length: job.length,
    noDiaOfAmWire: job.noDiaOfAmWire,
    payOffDno: job.payOffDno,
    takeUpDrumSize: job.takeUpDrumSize,
    embrossing: job.embrossing,
    remark: job.remark,
  });

  const handleEdit = (data) => {
    setFormData(populateFormData(data));
    setIsEdit(true);
    setViewOpen(false);
    setDialogOpen(true);
  };

  const handleView = (job) => {
    setFormData(populateFormData(job));
    setViewOpen(true);
    setDialogOpen(false);
  };

  const handleDelete = async (job) => {

    if (window.confirm(`Are you sure you want to delete job card "${job.orderNo}"?`)) {


      try {
        await deleteJobCard(job.id);
        showAlert("success", "Job card deleted successfully");
        fetchJobCardData();
      } catch {
        showAlert("error", "Failed to delete job card");
      }
    }
  };


  const handleSave = async () => {
    const payload = {
      ...formData,
      assetId: Number(formData.assetId),
      shiftId: Number(formData.shiftId),
      operationId: Number(formData.operationId),
      isCompacted: formData.isCompacted === "yes",
      detail: formData.remark || "",
      createdBy: Number(userId),
      createdOn: new Date().toISOString(),
      updatedOn: new Date().toISOString(),
    };

    if (!formData.orderNo || !formData.date || !formData.assetId || !formData.shiftId || !formData.operationId) {
      showAlert("error", "Please fill all required fields");
      return;
    }

    try {
      if (isEdit) {
        await updateJobCard(formData.id, payload);
        showAlert("success", "Job card updated successfully");
      } else {
        await createJobCard(payload);
        showAlert("success", "Job card created successfully");
      }
      setDialogOpen(false);
      await fetchJobCardData();
    } catch (error) {
      showAlert("error", error.response?.data?.message || "Failed to save job card");
    }
  };

  const csvHeaders = [
    { label: "Order No", key: "orderNo" },
    { label: "Asset", key: "assetName" },
    { label: "Operation", key: "operationName" },
    { label: "Shift", key: "shiftName" },
    { label: "Is Compacted", key: "isCompacted" },
  ];

  const transformedStockData = jobCards.map((job) => ({
    orderNo: job.orderNo,
    assetName: assets.find((a) => a.assetId === job.assetId)?.assetName || "-",
    operationName: operations.find((o) => o.operationId === job.operationId)?.operationName || "-",
    shiftName: shift.find((s) => s.shiftId === job.shiftId)?.shiftName || "-",
    isCompacted: job.isCompacted ? "Yes" : "No",
  }));

  return (
    <Container maxWidth={false}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>

        <Typography variant="h4">Job Card</Typography>
        <Box display="flex" gap={2}>
          <TextField
            placeholder="Search by Order No..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>

              )
            }}
            size="small"
            sx={{ width: 300 }}
          />
          <ExportCSVButton
            data={transformedStockData}
            filename="jobcard_data.csv"
            headers={csvHeaders}
          />

          <Button variant="contained" onClick={handleCreate}>Create Job Card</Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Order No</TableCell>
              <TableCell>Asset</TableCell>
              <TableCell>Operation</TableCell>
              <TableCell>Shift</TableCell>
              <TableCell>Is Compacted</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobCards.filter(j => j.orderNo?.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((job, index) => (
                <TableRow key={job.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{job.orderNo}</TableCell>
                  <TableCell>{assets.find(a => a.assetId === job.assetId)?.assetName || '-'}</TableCell>
                  <TableCell>{operations.find(o => o.operationId === job.operationId)?.operationName || '-'}</TableCell>
                  <TableCell>{shift.find(s => s.shiftId === job.shiftId)?.shiftName || '-'}</TableCell>
                  <TableCell>{job.isCompacted ? "Yes" : "No"}</TableCell>
                  <TableCell>

                    <Tooltip title="View"><IconButton onClick={() => handleView(job)} color="info"><VisibilityIcon /></IconButton></Tooltip>
                    <Tooltip title="Edit"><IconButton onClick={() => handleEdit(job)} color="primary"><EditIcon /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton onClick={() => handleDelete(job)} color="error"><DeleteIcon /></IconButton></Tooltip>

                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        {jobCards.length === 0 && (
          <Box p={2} textAlign="center">
            <Typography variant="body1">No job cards found.</Typography>
          </Box>
        )}
      </TableContainer>

      {/* Dialogs */}
      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{isEdit ? "Edit Job Card" : "Create Job Card"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={1}>
            {/* Left Column */}
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Order No" name="orderNo" value={formData.orderNo} onChange={handleChange} />
              <TextField fullWidth label="IS Code" name="isCode" value={formData.isCode} onChange={handleChange} sx={{ mt: 2 }} />
              <TextField fullWidth type="date" label="Date" name="date" value={formData.date} onChange={handleChange} sx={{ mt: 2 }} InputLabelProps={{ shrink: true }} />
              <TextField select fullWidth label="Asset" name="assetId" value={formData.assetId} onChange={handleChange} sx={{ mt: 2 }}>
                {assets.map((a) => <MenuItem key={a.assetId} value={a.assetId}>{a.assetName}</MenuItem>)}
              </TextField>
              <TextField select fullWidth label="Shift" name="shiftId" value={formData.shiftId} onChange={handleChange} sx={{ mt: 2 }}>
                {shift.map((s) => <MenuItem key={s.shiftId} value={s.shiftId}>{s.shiftName}</MenuItem>)}
              </TextField>
              <TextField select fullWidth label="Operation" name="operationId" value={formData.operationId} onChange={handleChange} sx={{ mt: 2 }}>
                {operations.map((o) => <MenuItem key={o.operationId} value={o.operationId}>{o.operationName}</MenuItem>)}
              </TextField>
              <TextField fullWidth label="Size" name="size" value={formData.size} onChange={handleChange} sx={{ mt: 2 }} />
              <TextField fullWidth label="No. Dia of Stands" name="noDiaOfStands" value={formData.noDiaOfStands} onChange={handleChange} sx={{ mt: 2 }} />
              <TextField fullWidth label="Shape" name="shape" value={formData.shape} onChange={handleChange} sx={{ mt: 2 }} />
              <FormControl sx={{ mt: 2 }}>
                <FormLabel>Is Compacted</FormLabel>
                <RadioGroup row name="isCompacted" value={formData.isCompacted} onChange={handleChange}>
                  <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>
            {/* Right Column */}
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Compound" name="compound" value={formData.compound} onChange={handleChange} sx={{ mt: 2 }} />
              <TextField fullWidth label="Color" name="color" value={formData.color} onChange={handleChange} sx={{ mt: 2 }} />
              <TextField fullWidth label="Thickness" name="thickness" value={formData.thickness} onChange={handleChange} sx={{ mt: 2 }} />
              <TextField fullWidth label="Length" name="length" value={formData.length} onChange={handleChange} sx={{ mt: 2 }} />
              <TextField fullWidth label="No. Dia of AM Wire" name="noDiaOfAmWire" value={formData.noDiaOfAmWire} onChange={handleChange} sx={{ mt: 2 }} />
              <TextField fullWidth label="Pay Off Dno" name="payOffDno" value={formData.payOffDno} onChange={handleChange} sx={{ mt: 2 }} />
              <TextField fullWidth label="Take Up Drum Size" name="takeUpDrumSize" value={formData.takeUpDrumSize} onChange={handleChange} sx={{ mt: 2 }} />
              <TextField fullWidth label="Embrossing" name="embrossing" value={formData.embrossing} onChange={handleChange} sx={{ mt: 2 }} />
              <TextField fullWidth label="Remarks" name="remark" value={formData.remark} onChange={handleChange} sx={{ mt: 2 }} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>View Job Card</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            {Object.entries({
              ...formData,
              assetId: assets.find(a => a.assetId === formData.assetId)?.assetName || "-",
              operationId: operations.find(o => o.operationId === formData.operationId)?.operationName || "-",
              shiftId: shift.find(s => s.shiftId === formData.shiftId)?.shiftName || "-",
              isCompacted: formData.isCompacted === "yes" ? "Yes" : "No",
            }).map(([key, value]) => (
              <TextField key={key} fullWidth label={key} value={value || ''} disabled />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <AlertSnackbar
        open={alert.open}
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ ...alert, open: false })}
      />
    </Container>
  );
};

export default JobCard;