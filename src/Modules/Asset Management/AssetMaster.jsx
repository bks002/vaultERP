import React, { useState } from "react";
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
  Paper,
  InputAdornment,
} from "@mui/material";

const AssetMaster = () => {
   const officeId = useSelector((state) => state.user.officeId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [assets, setAssets] = useState([]); // ✅ Store asset list
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
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    setAssets((prev) => [...prev, formData]); // ✅ Add new asset to the list
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
    asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.description.toLowerCase().includes(searchQuery.toLowerCase())
);

  return (
    <Container maxWidth="lg">
      {/* Header with Button */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ my: 3 }}>
        <Typography variant="h4">Asset Master  {officeId}</Typography>
        <TextField
                                placeholder="Search by type or description"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                size="small"
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

      {/* ✅ Table Container */}
      {loading && <Typography>Loading data...</Typography>}
      
                  {!loading && (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Asset Name</TableCell>
              <TableCell>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAssets.length > 0 ? (
              filteredAssets.map((asset, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{asset.assetName}</TableCell>
                  <TableCell>{asset.description}</TableCell>
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
            <Grid item xs={12} md={6}>
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
            </Grid>

            {/* Right Column */}
            <Grid item xs={12} md={6}>
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
              <Button variant="outlined" component="label" fullWidth sx={{ mt: 2 }}>
                Upload AMC File
                <input hidden type="file" name="amcUpload" />
              </Button>
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
    </Container>
  );
};

export default AssetMaster;
