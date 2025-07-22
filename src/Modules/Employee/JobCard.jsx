import React, { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { useSelector } from "react-redux";
import {
  Container, Typography, Grid, TextField, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  MenuItem, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, InputAdornment, IconButton, Tooltip, Stack, Paper, Checkbox, FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SettingsIcon from '@mui/icons-material/Settings';
import {assetTypes} from "../../Components/constant";
import { getAllAssets, createAssets, EditAssets, deleteAsset } from "../../Services/AssetService";
import { getAllOperation } from "../../Services/OperationService";
import { getAssetOperation, OperationMapping } from "../../Services/AssetOperation";
import AlertSnackbar from "../../Components/Alert/AlertSnackBar";
import { getAllShift } from "../../Services/ShiftService";


const JobCard = () => {
  const officeId = useSelector((state) => state.user.officeId);
  const userId = useSelector((state) => state.user.userId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [assets, setAssets] = useState([]);
  const [shift, setShift] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [settingOpen, setSettingOpen] = useState(false);
  const [operations, setOperations] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [alert, setAlert] = useState({ open: false, type: 'success', message: '' });
  const [viewOpen, setViewOpen] = useState(false);

  const defaultFormData = {
    nameId: "",
    isCode: "",
    assetName: "",
    shift: "",
    operation: "",
    size: "",
    noStands: "",
    isCompleted: "",
    compound: "",
    color: "",
    thickness: "",
    length: "",
    dayWork:"",
    dayD: "",
    damSize: "",
    embossing:"",
    remarks: "",
  };

  const [formData, setFormData] = useState(defaultFormData);

  const showAlert = (type, message) => {
    setAlert({ open: true, type, message });
  };

  useEffect(() => {
    if (officeId) {
      loadAllassets();
      loadAllOperations();
       loadAllShift();
    }
  }, [officeId]);

  const loadAllShift = async () => {
  try {
    const data = await getAllShift(officeId);
    setShift(data); // contains shiftName, shiftCode, etc.
  } catch {
    showAlert('error', 'Failed to load shifts');
  }
};

  const loadAllassets = async () => {
    try {
      setLoading(true);
      const data = await getAllAssets(officeId);
      setAssets(data);
    } catch {
      showAlert('error', 'Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  const loadAllOperations = async () => {
    try {
      const data = await getAllOperation(officeId);
      setOperations(data);
    } catch {
      showAlert('error', 'Failed to load operations');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    const payload = {
    assetId: formData.assetId || 0,           // only if updating
    assetName: formData.assetName || "",
    color: formData.color || "",
    compound: formData.compound || "",
    damSize: formData.damSize || "",
    dayD: formData.dayD || "",
    dayWork: formData.dayWork || "",
    embossing: formData.embossing || "",
    isCode: formData.isCode || "",
    isCompleted: formData.isCompleted || "no",
    length: formData.length || "",
    nameId: formData.nameId || "",
    noStands: formData.noStands || "",
    officeId: parseInt(officeId),
    operation: formData.operation || "",
    remarks: formData.remarks || "",
    shift: formData.shift || "",
    size: formData.size || "",
    thickness: formData.thickness || "",
    createdBy: String(userId),
    };
    console.log(payload)
    try {
      if (isEdit) {
        await EditAssets(payload, formData.assetId);
        showAlert('success', 'asset updated successfully');
      } else {
        await createAssets(payload);
        showAlert('success', 'asset created successfully');
      }

      setDialogOpen(false);
      loadAllassets();
    } catch {
      showAlert('error', 'Failed to save asset');
    }
  };

  const handleSaveSettings = async () => {
    try {
      const payload = {
        assetId: formData.assetId,
        operationIds: selectedIds,
        updatedBy: userId
      };
      await OperationMapping(payload);
      showAlert("success", "Operations mapped successfully");
      setSettingOpen(false);
      loadAllassets();
    } catch (error) {
      showAlert("error", error.message || "Failed to map operations");
    }
  };

  const filteredAssets = assets.filter((asset) =>
    asset.assetName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCheckboxChange = (assetId) => {
    setSelectedIds((prev) =>
      prev.includes(assetId)
        ? prev.filter((id) => id !== assetId)
        : [...prev, assetId]
    );
  };

  const handleSettings = async (asset) => {
    try {
      setFormData({ ...asset });
      const mappedOps = await getAssetOperation(asset.assetId);
      const ids = mappedOps.map(op => (typeof op === "object" ? op.operationId : op));
      setSelectedIds(ids);
      setSettingOpen(true);
    } catch (err) {
      showAlert("error", "Failed to load mapped operations");
    }
  };

  const handleEdit = (asset) => {
    setIsEdit(true)
    setFormData(asset);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setIsEdit(false);
    setFormData({
       nameId: "",
    isCode: "",
    assetName: "",
    shift: "",
    operation: "",
    size: "",
    noStands: "",
    isCompleted: "",
    compound: "",
    color: "",
    thickness: "",
    length: "",
    dayWork:"",
    dayD: "",
    damSize: "",
    embossing:"",
    remarks: "",
    });
    setDialogOpen(true);
  };

  const handleView = (asset) => {
    setFormData(asset);
    setViewOpen(true);
  };

  const handleDelete = async (asset) => {
    if (window.confirm(`Are you sure you want to delete "${asset.assetName}"?`)) {
      try {
        await deleteAsset(asset.assetId);
        showAlert('success', 'Asset deleted successfully');
        loadAllassets();
      } catch {
        showAlert('error', 'Failed to delete asset');
      }
    }
  };

  return (
    <Container maxWidth={false}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4">Job Card</Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            placeholder="Search Assets..."
            variant="outlined"
            sx={{ width: 300 }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button variant="contained" color="primary" onClick={handleCreate}>
            Create Job Card
          </Button>
        </Box>
      </Box>

      {/* Table */}
      {loading ? (
        <Typography>Loading data...</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Job Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAssets.length > 0 ? (
                filteredAssets.map((asset, index) => (
                  <TableRow key={index}>
                    
                  
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={4} align="center">No asset records found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{isEdit ? "Edit Job Card" : "Create Job Card"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={12} md={6} size={6}>
            <TextField fullWidth label="Order No./ Name" name="nameId" value={formData.nameId} onChange={handleChange} sx={{ mt: 2 }} />

              <TextField fullWidth label="Is Code" name="isCode" value={formData.isCode} onChange={handleChange} sx={{ mt: 2 }} />
            <TextField
                select
                fullWidth
                label="Asset Name"
                name="assetId"
                value={formData.assetId}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const selectedAsset = assets.find((a) => a.assetId === selectedId);
                  setFormData((prev) => ({
                    ...prev,
                    assetId: selectedId,
                    assetName: selectedAsset?.assetName || ""
                  }));
                }}
                sx={{ mt: 2 }}
              >
                {assets.map((asset) => (
                  <MenuItem key={asset.assetId} value={asset.assetId}>
                    {asset.assetName}
                  </MenuItem>
                ))}
              </TextField>            
               <TextField
  select
  fullWidth
  label="Shift"
  name="shift"
  value={formData.shift}
  onChange={handleChange}
  sx={{ mt: 2 }}
>
  {shift.map((s) => (
    <MenuItem key={s.shiftId} value={s.shiftId}>
      {s.shiftName}
    </MenuItem>
  ))}
</TextField>

<TextField
  select
  fullWidth
  label="Operation"
  name="operation"
  value={formData.operation}
  onChange={handleChange}
  sx={{ mt: 2 }}
>
  {operations.map((op) => (
    <MenuItem key={op.operationId} value={op.operationId}>
      {op.operationName}
    </MenuItem>
  ))}
</TextField>
              <TextField fullWidth label="Size" name="size" value={formData.size} onChange={handleChange} sx={{ mt: 2 }} />
              <TextField fullWidth label="No of Stands" name="noStands" value={formData.noStands} onChange={handleChange} sx={{ mt: 2 }} />
            <FormControl fullWidth sx={{ mt: 1 }}>
                 <FormLabel id="is-completed-label">Is Completed</FormLabel>
                     <RadioGroup
                      row // optional: removes to stack vertically
                     aria-labelledby="is-completed-label"
                      name="isCompleted"
                     value={formData.isCompleted}
                     onChange={handleChange}
                     >
                      <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                      <FormControlLabel value="no" control={<Radio />} label="No" />
                     </RadioGroup>
                </FormControl>     
         <TextField fullWidth label="Compound" name="compound" value={formData.compound} onChange={handleChange} sx={{ mt: 2 }} />
            </Grid>

            <Grid item xs={12} md={6} size={6}>  
              <TextField fullWidth label="Color" name="color" value={formData.color} onChange={handleChange} sx={{ mt: 2 }} />
              <TextField fullWidth label="Thickness" name="thickness" value={formData.thickness} onChange={handleChange} sx={{ mt: 2 }} />
              <TextField fullWidth label="Length" name="length" value={formData.length} onChange={handleChange} sx={{ mt: 2 }} />
              <TextField fullWidth label="No of Day of Work" name="dayWork" value={formData.dayWork} onChange={handleChange} sx={{ mt: 2 }} />
              <TextField fullWidth label="Day of D.No" name="dayD" value={formData.dayD} onChange={handleChange} sx={{ mt: 2 }} />
              <TextField fullWidth label="Takeup Dam Size" name="damSize" value={formData.damSize} onChange={handleChange} sx={{ mt: 2 }} />
              <TextField fullWidth label="Embossing" name="embossing" value={formData.embossing} onChange={handleChange} sx={{ mt: 2 }} />
              <TextField fullWidth label="Remarks" name="remarks" value={formData.remarks} onChange={handleChange} sx={{ mt: 2 }} />





            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="secondary">Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Operation Mapping Dialog */}
      <Dialog open={settingOpen} onClose={() => setSettingOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Map Operations</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Asset Id" value={formData.assetId} fullWidth disabled />
            <TextField label="Asset Name" value={formData.assetName} fullWidth disabled />
          </Stack>
          <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>Operation Name</TableCell>
                  <TableCell>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {operations.map((op) => (
                  <TableRow key={op.operationId}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(op.operationId)}
                        onChange={() => handleCheckboxChange(op.operationId)}
                      />
                    </TableCell>
                    <TableCell>{op.operationName}</TableCell>
                    <TableCell>{op.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveSettings}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>View Job Card</DialogTitle>
       <DialogContent> 
  <Stack spacing={2} mt={1}>
    <TextField fullWidth label="Order No./ Name" value={formData.nameId} disabled />
    <TextField fullWidth label="Is Code" value={formData.isCode} disabled />
    <TextField fullWidth label="Asset Name" value={formData.assetName} disabled />
    <TextField fullWidth label="Shift" value={formData.shiftName || ''} disabled />
    <TextField fullWidth label="Operation" value={formData.operationName || ''} disabled />
    <TextField fullWidth label="Size" value={formData.size} disabled />
    <TextField fullWidth label="No of Stands" value={formData.noStands} disabled />
    <TextField fullWidth label="Is Completed" value={formData.isCompleted === 'yes' ? 'Yes' : 'No'} disabled />
    <TextField fullWidth label="Compound" value={formData.compound} disabled />
    <TextField fullWidth label="Color" value={formData.color} disabled />
    <TextField fullWidth label="Thickness" value={formData.thickness} disabled />
    <TextField fullWidth label="Length" value={formData.length} disabled />
    <TextField fullWidth label="No of Day of Work" value={formData.dayWork} disabled />
    <TextField fullWidth label="Day of D.No" value={formData.dayD} disabled />
    <TextField fullWidth label="Takeup Dam Size" value={formData.damSize} disabled />
    <TextField fullWidth label="Embossing" value={formData.embossing} disabled />
    <TextField fullWidth label="Remarks" value={formData.remarks} disabled />
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