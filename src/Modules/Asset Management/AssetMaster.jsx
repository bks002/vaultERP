import React, { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { useSelector } from "react-redux";
import {
  Container,
  Typography,
  Grid,
  TextField,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  IconButton,
  Tooltip
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SettingsIcon from '@mui/icons-material/Settings';
import { getAllAssets, createAssets } from "../../Services/AssetService";
import { getAssetOperation } from "../../Services/AssetOperation";

const AssetMaster = () => {
  const officeId = useSelector((state) => state.user.officeId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [assets, setAssets] = useState([]);
  const [selectedIds, setSelectedIds]= useState([]);
  const [formData, setFormData] = useState({
    assetName: "",
    assetType: "Machine/Equipment",
    manufacturer: "",
    assetModel: "",
    lastServiceDate: "",
    isRented: "No",
    description: "",
    assetStatus: "Active",
    assetLocation: "",
    assetImage: "",
    isMovable: "No",
    nextServiceDate: "",
    assetValue: 0,
    qrCode: "",
    assetCategory: "Computer",
    assetServiceReminder: "No Reminder",
    amcUpload: "",
    operationIds: [
            {
                operationId: '',
            }
        ]
  });

  useEffect(() => {
    if (officeId) {
      loadAllassets();
      loadAlloperation();
    }
  }, [officeId]);

  const loadAllassets = async () => {
    try {
      const data = await getAllAssets(officeId);
      setAssets(data);
    } catch {
      showAlert('error', 'Failed to load employee list');
    }
  };

  const loadAlloperation = async () => {
    try {
      const data = await getAllAssets(officeId);
      setAssets(data);
    } catch {
      showAlert('error', 'Failed to load employee list');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    setAssets((prev) => [...prev, formData]);
    setDialogOpen(false);
    setFormData({
      assetName: "",
      assetType: "Machine/Equipment",
      manufacturer: "",
      assetModel: "",
      lastServiceDate: "",
      isRented: "No",
      description: "",
      assetStatus: "Active",
      assetLocation: "",
      assetImage: "",
      isMovable: "No",
      nextServiceDate: "",
      assetValue: 0,
      qrCode: "",
      assetCategory: "Computer",
      assetServiceReminder: "No Reminder",
      amcUpload: "",
    });
  };
  const filteredAssets = assets.filter((asset) =>
    asset.assetName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCheckboxChange = (employeeId) => {
        setSelectedIds((prev) =>
            prev.includes(employeeId)
                ? prev.filter((id) => id !== employeeId)
                : [...prev, employeeId]
        );
    };

  return (
    <Container maxWidth={false}>
      {/* Header with Button */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4">Asset Master</Typography>
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
          <Button variant="contained" color="primary" onClick={() => setDialogOpen(true)}>
            Add Asset Master
          </Button>
        </Box>
      </Box>

      {/* ✅ Table Container */}
      {loading && <Typography>Loading data...</Typography>}

      {!loading && (
        <TableContainer >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Asset Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAssets.length > 0 ? (
                filteredAssets.map((asset, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{asset.assetName}</TableCell>
                    <TableCell>{asset.manufacturer}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="View">
                        <IconButton onClick={() => handleView(emp)} color="info">
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleEdit(emp)} color="primary">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleDelete(emp)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Operations">
                        <IconButton onClick={() => handleSettings(emp)} color="default">
                          <SettingsIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No asset records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Add New Asset</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={1}>
            {/* Left Column */}
            <Grid item xs={12} md={6} size={6}>
              <FormControl fullWidth sx={{ mt: 1 }}>
                <InputLabel>Asset Type</InputLabel>
                <Select name="assetType" value={formData.assetType} onChange={handleChange} label="Asset Type">
                  <MenuItem value="Machine/Equipment">Machine/Equipment</MenuItem>
                  <MenuItem value="Measuring Equipment">Measuring Equipment</MenuItem>
                  <MenuItem value="Facility">Facility</MenuItem>
                </Select>
              </FormControl>

              <TextField fullWidth label="Asset Model" name="assetModel" value={formData.assetModel} onChange={handleChange} sx={{ mt: 2 }} />
              <TextField fullWidth label="Last Service Date" name="lastServiceDate" type="date" InputLabelProps={{ shrink: true }} value={formData.lastServiceDate} onChange={handleChange} sx={{ mt: 2 }} />
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Is Rented?</InputLabel>
                <Select name="isRented" value={formData.isRented} onChange={handleChange} label="Is Rented?">
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </Select>
              </FormControl>
              <TextField fullWidth label="Description" name="description" value={formData.description} onChange={handleChange} sx={{ mt: 2 }} />
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Asset Status</InputLabel>
                <Select name="assetStatus" value={formData.assetStatus} onChange={handleChange} label="Asset Status">
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                  <MenuItem value="Under Repair">Under Repair</MenuItem>
                </Select>
              </FormControl>
              <TextField fullWidth label="Asset Location" name="assetLocation" value={formData.assetLocation} onChange={handleChange} sx={{ mt: 2 }} />
              <Button variant="outlined" component="label" fullWidth sx={{ mt: 2 }}>
                Upload Asset Image
                <input hidden type="file" name="assetImage" />
              </Button>
              <Button variant="outlined" component="label" fullWidth sx={{ mt: 2 }}>
                Upload AMC File
                <input hidden type="file" name="amcUpload" />
              </Button>
            </Grid>

            {/* Right Column */}
            <Grid item xs={12} md={6} size={6}>
              <TextField fullWidth label="Asset Name" name="assetName" value={formData.assetName} onChange={handleChange} sx={{ mt: 1 }} />
              <TextField fullWidth label="Manufacturer" name="manufacturer" value={formData.manufacturer} onChange={handleChange} sx={{ mt: 2 }} />
              <TextField fullWidth label="Next Service Date" name="nextServiceDate" type="date" InputLabelProps={{ shrink: true }} value={formData.nextServiceDate} onChange={handleChange} sx={{ mt: 2 }} />
              <TextField fullWidth label="Asset Value" name="assetValue" type="number" value={formData.assetValue} onChange={handleChange} sx={{ mt: 2 }} />
              <TextField fullWidth label="QR Code" name="qrCode" value={formData.qrCode} onChange={handleChange} sx={{ mt: 2 }} />
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Asset Category</InputLabel>
                <Select name="assetCategory" value={formData.assetCategory} onChange={handleChange} label="Asset Category">
                  <MenuItem value="Computer">Computer</MenuItem>
                  <MenuItem value="Electrical">Electrical</MenuItem>
                  <MenuItem value="Furniture">Furniture</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Asset Service Reminder</InputLabel>
                <Select name="assetServiceReminder" value={formData.assetServiceReminder} onChange={handleChange} label="Asset Service Reminder">
                  <MenuItem value="No Reminder">No Reminder</MenuItem>
                  <MenuItem value="Monthly">Monthly</MenuItem>
                  <MenuItem value="Quarterly">Quarterly</MenuItem>
                  <MenuItem value="Yearly">Yearly</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Is Movable?</InputLabel>
                <Select name="isMovable" value={formData.isMovable} onChange={handleChange} label="Is Movable">
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={settingOpen} onClose={() => setSettingOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Operation Employee</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Employee Name" value={selectedEmployee.employeeName} fullWidth />
            <TextField label="Employee Code" value={selectedEmployee.employeeCode} fullWidth />
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

    </Container>
  );
};

export default AssetMaster;