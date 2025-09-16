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
import BuildIcon from '@mui/icons-material/Build';
import { getAssetSpares, deleteAssetSpare, addAssetSpare, updateAssetSpare } from "../../Services/AssetSpare";

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
  const [spareDialogOpen, setSpareDialogOpen] = useState(false);
  const [spares, setSpares] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [spareViewOpen, setSpareViewOpen] = useState(false);
  const [spareEditMode, setSpareEditMode] = useState(false);
  // new state just for spare form
  const [spareForm, setSpareForm] = useState({
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
    vendorName: "",
    purchaseRate: 0,
    averageCost: 0,
    leadTimeDays: 0,
    criticality: "",
    warrantyExpiry: "",
    remarks: "",
    linkedAssetId: 0
  });

  const defaultFormData = {
    assetId: 0,
    assetCode: "",
    assetName: "",
    assetTypeId: "",
    manufacturer: "",
    modelNumber: "",
    serialNumber: "",
    purchaseDate: "",
    warrantyExpiry: "",
    lastServiceDate: "",
    nextServiceDate: "",
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

  const handleSpareParts = async (asset) => {
    setSelectedAsset(asset);
    setSpares([]); // reset previous spares
    setSpareDialogOpen(true); // open dialog immediately

    try {
      const data = await getAssetSpares(asset.assetId);
      setSpares(data);
    } catch {
      showAlert("error", "Failed to load spare parts");
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
    if (!formData.assetId || isNaN(parseInt(formData.assetId))) {
      showAlert("error", "Invalid Asset ID");
      return;
    }

    const payload = {
      assetId: parseInt(formData.assetId),
      operationIds: selectedIds.map(id => parseInt(id)), // ensure integers
      updatedBy: parseInt(userId)
    };

    try {
      await OperationMapping(payload); // no dto wrapper
      showAlert("success", "Operations mapped successfully");
      setSettingOpen(false);
      loadAllassets();
    } catch (error) {
      console.error("Mapping error:", error.response || error);
      showAlert("error", error.response?.data?.title || "Failed to map operations");
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
    { label: "Last Service Date", key: "lastServiceDate" },
    { label: "Next Service Date", key: "nextServiceDate" },
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
                      <Tooltip title="Spare Parts">
                        <IconButton onClick={() => handleSpareParts(asset)}>
                          <BuildIcon />
                        </IconButton>
                      </Tooltip>
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
              <TextField fullWidth label="Last Service Date" name="lastServiceDate" type="date" InputLabelProps={{ shrink: true }} value={formData.lastServiceDate?.split("T")[0] || ""} onChange={handleChange} sx={{ mt: 2 }} />
              <TextField fullWidth label="Next Service Date" name="nextServiceDate" type="date" InputLabelProps={{ shrink: true }} value={formData.nextServiceDate?.split("T")[0] || ""} onChange={handleChange} sx={{ mt: 2 }} />
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
            <TextField fullWidth label="Last Service Date" value={formData.lastServiceDate?.split("T")[0] || ""} type="date" InputLabelProps={{ shrink: true }} disabled />
            <TextField fullWidth label="Next Service Date" value={formData.nextServiceDate?.split("T")[0] || ""} type="date" InputLabelProps={{ shrink: true }} disabled />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={spareDialogOpen} onClose={() => setSpareDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Asset Spare Parts - {selectedAsset?.assetName}</DialogTitle>
        <DialogContent>
          {/* Add Spare Form */}
          <Box mt={2} mb={3}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Spare Code" value={spareForm.spareCode} onChange={(e) => setSpareForm({ ...spareForm, spareCode: e.target.value })} />
                <TextField fullWidth label="Spare Name" sx={{ mt: 2 }} value={spareForm.spareName} onChange={(e) => setSpareForm({ ...spareForm, spareName: e.target.value })} />
                <TextField fullWidth label="Part Number" sx={{ mt: 2 }} value={spareForm.partNumber} onChange={(e) => setSpareForm({ ...spareForm, partNumber: e.target.value })} />
                <TextField fullWidth label="Category" sx={{ mt: 2 }} value={spareForm.category} onChange={(e) => setSpareForm({ ...spareForm, category: e.target.value })} />
                <TextField fullWidth label="Specification" sx={{ mt: 2 }} value={spareForm.specification} onChange={(e) => setSpareForm({ ...spareForm, specification: e.target.value })} />
                <TextField fullWidth label="Unit of Measure" sx={{ mt: 2 }} value={spareForm.unitOfMeasure} onChange={(e) => setSpareForm({ ...spareForm, unitOfMeasure: e.target.value })} />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField fullWidth type="number" label="Current Stock" value={spareForm.currentStock} onChange={(e) => setSpareForm({ ...spareForm, currentStock: parseInt(e.target.value) || 0 })} />
                <TextField fullWidth type="number" label="Reorder Level" sx={{ mt: 2 }} value={spareForm.reorderLevel} onChange={(e) => setSpareForm({ ...spareForm, reorderLevel: parseInt(e.target.value) || 0 })} />
                <TextField fullWidth type="number" label="Reorder Quantity" sx={{ mt: 2 }} value={spareForm.reorderQuantity} onChange={(e) => setSpareForm({ ...spareForm, reorderQuantity: parseInt(e.target.value) || 0 })} />
                <TextField fullWidth label="Location" sx={{ mt: 2 }} value={spareForm.location} onChange={(e) => setSpareForm({ ...spareForm, location: e.target.value })} />
                <TextField fullWidth label="Vendor Name" sx={{ mt: 2 }} value={spareForm.vendorName} onChange={(e) => setSpareForm({ ...spareForm, vendorName: e.target.value })} />
                <TextField fullWidth type="number" label="Purchase Rate" sx={{ mt: 2 }} value={spareForm.purchaseRate} onChange={(e) => setSpareForm({ ...spareForm, purchaseRate: parseFloat(e.target.value) || 0 })} />
                <TextField fullWidth type="number" label="Average Cost" sx={{ mt: 2 }} value={spareForm.averageCost} onChange={(e) => setSpareForm({ ...spareForm, averageCost: parseFloat(e.target.value) || 0 })} />
                <TextField fullWidth type="number" label="Lead Time (Days)" sx={{ mt: 2 }} value={spareForm.leadTimeDays} onChange={(e) => setSpareForm({ ...spareForm, leadTimeDays: parseInt(e.target.value) || 0 })} />
                <TextField fullWidth label="Criticality" sx={{ mt: 2 }} value={spareForm.criticality} onChange={(e) => setSpareForm({ ...spareForm, criticality: e.target.value })} />
                <TextField fullWidth type="date" label="Warranty Expiry" InputLabelProps={{ shrink: true }} sx={{ mt: 2 }} value={spareForm.warrantyExpiry?.split("T")[0] || ""} onChange={(e) => setSpareForm({ ...spareForm, warrantyExpiry: e.target.value })} />
                <TextField fullWidth label="Remarks" sx={{ mt: 2 }} value={spareForm.remarks} onChange={(e) => setSpareForm({ ...spareForm, remarks: e.target.value })} />
              </Grid>
            </Grid>
            <Button
              sx={{ mt: 3 }}
              variant="contained"
              onClick={async () => {
                const payload = {
                  ...spareForm,
                  linkedAssetId: selectedAsset.assetId,
                  updatedBy: userId,
                  isActive: true
                };

                try {
                  if (spareEditMode) {
                    // call your update API
                    await updateAssetSpare(spareForm.spareId, payload);
                    showAlert("success", "Spare updated successfully");
                  } else {
                    await addAssetSpare(payload);
                    showAlert("success", "Spare added successfully");
                  }

                  const updatedSpares = await getAssetSpares(selectedAsset.assetId);
                  setSpares(updatedSpares);
                  setSpareForm({
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
                    vendorName: "",
                    purchaseRate: 0,
                    averageCost: 0,
                    leadTimeDays: 0,
                    criticality: "",
                    warrantyExpiry: "",
                    remarks: "",
                    linkedAssetId: 0
                  }); // reset form
                  setSpareEditMode(false); // reset edit mode
                } catch {
                  showAlert("error", spareEditMode ? "Failed to update spare" : "Failed to add spare");
                }
              }}
            >
              {spareEditMode ? "Update Spare" : "Save Spare"}
            </Button>
          </Box>

          {/* Show Spare Parts List */}
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Spare Code</TableCell>
                  <TableCell>Spare Name</TableCell>
                  <TableCell>Part Number</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Current Stock</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {spares.length > 0 ? (
                  spares.map((spare, index) => (
                    <TableRow key={spare.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{spare.spareCode}</TableCell>
                      <TableCell>{spare.spareName}</TableCell>
                      <TableCell>{spare.partNumber}</TableCell>
                      <TableCell>{spare.category}</TableCell>
                      <TableCell>{spare.currentStock}</TableCell>
                      <TableCell>
                        <Tooltip title="View">
                          <IconButton color="info" onClick={() => {
                            setSpareForm(spare);
                            setSpareViewOpen(true);
                          }}>
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton color="primary" onClick={() => {
                            setSpareForm(spare);
                            setSpareEditMode(true);
                            setSpareDialogOpen(true);
                          }}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            color="error"
                            onClick={async () => {
                              if (window.confirm(`Delete "${spare.spareName}"?`)) {
                                try {
                                  await deleteAssetSpare(spare.spareId);
                                  const updatedSpares = await getAssetSpares(selectedAsset.assetId);
                                  setSpares(updatedSpares);
                                  showAlert("success", "Spare deleted successfully");
                                } catch {
                                  showAlert("error", "Failed to delete spare");
                                }
                              }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">No spares found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSpareDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={spareViewOpen} onClose={() => setSpareViewOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>View Spare - {spareForm.spareName}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField fullWidth label="Spare Code" value={spareForm.spareCode} disabled />
            <TextField fullWidth label="Spare Name" value={spareForm.spareName} disabled />
            <TextField fullWidth label="Part Number" value={spareForm.partNumber} disabled />
            <TextField fullWidth label="Category" value={spareForm.category} disabled />
            <TextField fullWidth label="Specification" value={spareForm.specification} disabled />
            <TextField fullWidth label="Unit of Measure" value={spareForm.unitOfMeasure} disabled />
            <TextField fullWidth label="Current Stock" value={spareForm.currentStock} disabled />
            <TextField fullWidth label="Reorder Level" value={spareForm.reorderLevel} disabled />
            <TextField fullWidth label="Reorder Quantity" value={spareForm.reorderQuantity} disabled />
            <TextField fullWidth label="Location" value={spareForm.location} disabled />
            <TextField fullWidth label="Vendor Name" value={spareForm.vendorName} disabled />
            <TextField fullWidth label="Purchase Rate" value={spareForm.purchaseRate} disabled />
            <TextField fullWidth label="Average Cost" value={spareForm.averageCost} disabled />
            <TextField fullWidth label="Lead Time (Days)" value={spareForm.leadTimeDays} disabled />
            <TextField fullWidth label="Criticality" value={spareForm.criticality} disabled />
            <TextField fullWidth label="Warranty Expiry" value={spareForm.warrantyExpiry?.split("T")[0]} disabled />
            <TextField fullWidth label="Remarks" value={spareForm.remarks} disabled />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSpareViewOpen(false)}>Close</Button>
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
