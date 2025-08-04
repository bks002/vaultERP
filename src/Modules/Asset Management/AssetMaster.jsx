import React, { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { useSelector } from "react-redux";
import {
  Container, Typography, Grid, TextField, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  MenuItem, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, InputAdornment, IconButton, Tooltip, Stack, Paper, Checkbox
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SettingsIcon from '@mui/icons-material/Settings';


import { assetTypes } from "../../Components/constant";

import { getAllAssets, createAssets, EditAssets, deleteAsset } from "../../Services/AssetService";
import { getAllOperation } from "../../Services/OperationService";
import { getAssetOperation, OperationMapping } from "../../Services/AssetOperation";
import AlertSnackbar from "../../Components/Alert/AlertSnackBar";
import ExportCSVButton from "../../Components/Export to CSV/ExportCSVButton";

const AssetMaster = () => {
  const officeId = useSelector((state) => state.user.officeId);
  const userId = useSelector((state) => state.user.userId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [assets, setAssets] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [settingOpen, setSettingOpen] = useState(false);
  const [operations, setOperations] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [alert, setAlert] = useState({ open: false, type: 'success', message: '' });
  const [viewOpen, setViewOpen] = useState(false);

  const defaultFormData = {
    assetId: "",
    assetCode: "",
    assetName: "",
    assetTypeId: "",
    manufacturer: "",
    modelNumber: "",
    serialNumber: "",
    purchaseDate: "",
    warrantyExpiry: "",
    supplier: "",
    operationIds: [],
  };

  const [formData, setFormData] = useState(defaultFormData);

  const showAlert = (type, message) => {
    setAlert({ open: true, type, message });
  };

  useEffect(() => {
    if (officeId) {
      loadAllassets();
      loadAllOperations();
    }
  }, [officeId]);

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
      ...formData,
      officeId: parseInt(officeId),
      createdBy: String(userId),
      isActive: true
    };
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

  const csvHeaders = [
    { label: "Asset Id", key: "assetId" },
    { label: "Asset Code", key: "assetCode" },
    { label: "Asset Name", key: "assetName" },
    { label: "Asset Type", key: "assetType" },
    { label: "Manufacturer", key: "manufacturer" },
    { label: "Model Number", key: "modelNumber" },
    { label: "Serial Number", key: "serialNumber" },
    { label: "Purchase Date", key: "purchaseDate" },
    { label: "Warranty Expiry", key: "warrantyExpiry" },
    { label: "Supplier", key: "supplier" }
  ];

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
    setFormData(defaultFormData);
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

  const filteredAssets = assets
    .filter((v) =>
      v.assetName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map((v) => ({
      ...v,
      assetType: assetTypes.find((t) => t.id === v.assetTypeId)?.type || ''
    }));

  return (
    <Container maxWidth={false}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4">Asset Master</Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <TextField

            variant="outlined"
            sx={{ width: 300 }}

            placeholder="Search by Asset name, Manufacturer"

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
          />

          <ExportCSVButton
            data={filteredAssets}
            filename="Assets.csv"
            headers={csvHeaders}
          />

          <Button variant="contained" color="primary" onClick={handleCreate}>
            Add Asset Master
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
                <TableCell>Asset Name</TableCell>
                <TableCell>Manufacturer</TableCell>
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
                      <Tooltip title="View"><IconButton onClick={() => handleView(asset)} color="info"><VisibilityIcon /></IconButton></Tooltip>
                      <Tooltip title="Edit"><IconButton onClick={() => handleEdit(asset)} color="primary"><EditIcon /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton onClick={() => handleDelete(asset)} color="error"><DeleteIcon /></IconButton></Tooltip>
                      <Tooltip title="Operations"><IconButton onClick={() => handleSettings(asset)}><SettingsIcon /></IconButton></Tooltip>
                    </TableCell>
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
        <DialogTitle>{isEdit ? "Edit Asset" : "Add New Asset"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={12} md={6} size={6}>
              <TextField fullWidth label="Asset Name" name="assetName" value={formData.assetName} onChange={handleChange} />
              <TextField fullWidth label="Model Number" name="modelNumber" value={formData.modelNumber} onChange={handleChange} sx={{ mt: 2 }} />
              <TextField fullWidth label="Purchase Date" name="purchaseDate" type="date" InputLabelProps={{ shrink: true }} value={formData.purchaseDate?.split("T")[0] || ""} onChange={handleChange} sx={{ mt: 2 }} />
              <TextField fullWidth label="Manufacturer" name="manufacturer" value={formData.manufacturer} onChange={handleChange} sx={{ mt: 2 }} />
              <TextField fullWidth label="Supplier" name="supplier" value={formData.supplier} onChange={handleChange} sx={{ mt: 2 }} />
            </Grid>

            <Grid item xs={12} md={6} size={6}>
              <TextField fullWidth label="Asset Code" name="assetCode" value={formData.assetCode} onChange={handleChange} />


              <TextField select fullWidth label="Asset Type" name="assetTypeId" value={formData.assetTypeId} onChange={handleChange} sx={{ mt: 2 }} >

                {assetTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.type}
                  </MenuItem>
                ))}
              </TextField>
              <TextField fullWidth label="Serial Number" name="serialNumber" value={formData.serialNumber} onChange={handleChange} sx={{ mt: 2 }} />
              <TextField fullWidth label="Warranty Expiry" name="warrantyExpiry" type="date" InputLabelProps={{ shrink: true }} value={formData.warrantyExpiry?.split("T")[0] || ""} onChange={handleChange} sx={{ mt: 2 }} />
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
        <DialogTitle>View Asset</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField fullWidth label="Asset Name" value={formData.assetName} disabled />
            <TextField fullWidth label="Asset Code" value={formData.assetCode} disabled />
            <TextField fullWidth label="Model Number" value={formData.modelNumber} disabled />
            <TextField fullWidth label="Serial Number" value={formData.serialNumber} disabled />
            <TextField
              fullWidth
              label="Asset Type"
              value={
                assetTypes.find((type) => type.id === formData.assetTypeId)?.type || ''
              }
              disabled
            />
            <TextField fullWidth label="Manufacturer" value={formData.manufacturer} disabled />
            <TextField fullWidth label="Supplier" value={formData.supplier} disabled />
            <TextField fullWidth label="Purchase Date" value={formData.purchaseDate?.split("T")[0] || ""} type="date" InputLabelProps={{ shrink: true }} disabled />
            <TextField fullWidth label="Warranty Expiry" value={formData.warrantyExpiry?.split("T")[0] || ""} type="date" InputLabelProps={{ shrink: true }} disabled />
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

export default AssetMaster;