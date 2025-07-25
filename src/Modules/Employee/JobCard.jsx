"use client";
import React, { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import {
  Container, Typography, Grid, TextField, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  MenuItem, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, InputAdornment, IconButton, Tooltip, Stack, Paper, Checkbox, FormControl,
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
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, type: "success", message: "" });

  const defaultFormData = {
    id: 0,
    orderNo: "",
    isCode: "",
    date: "",
    assetId: "",
    shiftId: "",
    operationId: "",
    size: "",
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
    createdOn:"",
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
    assetId: job.assetId,
    shiftId: job.shiftId,
    operationId: job.operationId,
    size: job.size,
    noDiaOfStands: job.noDiaOfStands,
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
    date: job.date,            
    shape: job.shape,  
  });

    const handleEdit = (data) => {
    setFormData({ ...data, isCompacted: data.isCompacted ? "yes" : "no" });
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
    detail: formData.remark || "", // ✅ fix 1: backend requires 'detail' field
    createdBy: Number(userId), 
    createdOn: new Date().toISOString(),
  };

  console.log("Submitting payload:", payload);

  if (!formData.orderNo || !formData.assetId || !formData.shiftId || !formData.operationId) {
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
    console.error("Save failed:", error.response?.data || error.message || error);
    showAlert("error", error.response?.data?.message || "Failed to save job card");
  }
};



  return (
    <Container maxWidth={false}>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
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
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{job.orderNo}</TableCell>
                  <TableCell>{assets.find(a => a.assetId === job.assetId)?.assetName || '-'}</TableCell>
                  <TableCell>{operations.find(o => o.operationId == job.operationId)?.operationName || '-'}</TableCell>
                  <TableCell>{shift.find(s => s.shiftId === job.shiftId)?.shiftName || '-'}</TableCell>
                  <TableCell>{job.isCompacted ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    <Tooltip title="View"><IconButton onClick={() => handleView(job)}><VisibilityIcon /></IconButton></Tooltip>
                    <Tooltip title="Edit"><IconButton onClick={() => handleEdit(job)}><EditIcon /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton onClick={() => handleDelete(job)}><DeleteIcon /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{isEdit ? "Edit Job Card" : "Create Job Card"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={1}>
  <Grid item xs={12} sm={6}>
    <TextField fullWidth label="Order No" name="orderNo" value={formData.orderNo} onChange={handleChange} />
    <TextField fullWidth label="IS Code" name="isCode" value={formData.isCode} onChange={handleChange} sx={{ mt: 2 }} />
    <TextField fullWidth label="Date" name="date" value={formData.date} onChange={handleChange} sx={{ mt: 2 }} />
    <TextField select fullWidth label="Asset" name="assetId" value={formData.assetId} onChange={handleChange} sx={{ mt: 2 }}>
      {assets.map((a) => (
        <MenuItem key={a.assetId} value={a.assetId}>
          {a.assetName}
        </MenuItem>
      ))}
    </TextField>
    <TextField select fullWidth label="Shift" name="shiftId" value={formData.shiftId} onChange={handleChange} sx={{ mt: 2 }}>
      {shift.map((s) => (
        <MenuItem key={s.shiftId} value={s.shiftId}>
          {s.shiftName}
        </MenuItem>
      ))}
    </TextField>
    <TextField select fullWidth label="Operation" name="operationId" value={formData.operationId} onChange={handleChange} sx={{ mt: 2 }}>
      {operations.map((o) => (
        <MenuItem key={o.operationId} value={o.operationId}>
          {o.operationName}
        </MenuItem>
      ))}
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
    <TextField fullWidth label="Order No" value={formData.orderNo || ''} disabled />
    <TextField fullWidth label="IS Code" value={formData.isCode || ''} disabled />
    <TextField fullWidth label="Date" value={formData.date || ''} disabled />
    <TextField fullWidth label="Asset" value={assets.find(a => a.assetId === formData.assetId)?.assetName || '-'} disabled />
    <TextField fullWidth label="Shift" value={shift.find(s => s.shiftId === formData.shiftId)?.shiftName || '-'} disabled />
    <TextField fullWidth label="Operation" value={operations.find(o => o.operationId === formData.operationId)?.operationName || '-'} disabled />
    <TextField fullWidth label="Size" value={formData.size || ''} disabled />
    <TextField fullWidth label="No. Dia of Stands" value={formData.noDiaOfStands || ''} disabled />
    <TextField fullWidth label="Shape" value={formData.shape || ''} disabled />
    <TextField fullWidth label="Is Compacted" value={formData.isCompacted === "yes" ? "Yes" : "No"} disabled />
    <TextField fullWidth label="Compound" value={formData.compound || ''} disabled />
    <TextField fullWidth label="Color" value={formData.color || ''} disabled />
    <TextField fullWidth label="Thickness" value={formData.thickness || ''} disabled />
    <TextField fullWidth label="Length" value={formData.length || ''} disabled />
    <TextField fullWidth label="No. Dia of AM Wire" value={formData.noDiaOfAmWire || ''} disabled />
    <TextField fullWidth label="Pay Off Dno" value={formData.payOffDno || ''} disabled />
    <TextField fullWidth label="Take Up Drum Size" value={formData.takeUpDrumSize || ''} disabled />
    <TextField fullWidth label="Embrossing" value={formData.embrossing || ''} disabled />
    <TextField fullWidth label="Remarks" value={formData.remark || ''} disabled />
   
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