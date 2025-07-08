import React, { useState } from "react";
import {
  Container,
  Typography,
  Grid,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Box,
  Button,
} from "@mui/material";

const AssetMaster = () => {
  const [formData, setFormData] = useState({
    assetName: "Asset Name",   
    assetType: "Machine/Equipment",
    manufacturer: "",
    assetModel: "",
    lastServiceDate: "",
    isRented: "No",
    description: "",
    assetStatus: "",
    assetLocation: "",
    assetImage: "",
    isMovable: "No",
    nextServiceDate: "",
    assetValue: 0,
    qrCode: "",
    assetCategory: "",
    assetServiceReminder: "No Reminder",
    amcUpload: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 3 }}>
        <Typography variant="h5" gutterBottom>
          Asset Master
        </Typography>

        <FormControl component="fieldset">
          <RadioGroup
            row
            name="assetType"
            value={formData.assetType}
            onChange={handleChange}
          >
            <FormControlLabel
              value="Machine/Equipment"
              control={<Radio />}
              label="Machine/Equipment"
            />
            <FormControlLabel
              value="Measuring Equipment"
              control={<Radio />}
              label="Measuring Equipment"
            />
            <FormControlLabel
              value="Facility"
              control={<Radio />}
              label="Facility"
            />
          </RadioGroup>
        </FormControl>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          {/* Left Column */}
          <Grid item xs={12} md={6} size={6}>
            <TextField
              fullWidth
              label="Asset Type"
              name="assetType"
              value={formData.manufacturer}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              label="Asset Model"
              name="assetModel"
              value={formData.assetModel}
              onChange={handleChange}
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              label="Last Service Date"
              name="lastServiceDate"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formData.lastServiceDate}
              onChange={handleChange}
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              label="Is Rented?"
              name="isRented"
              value={formData.isRentable}
              onChange={handleChange}
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              label="Asset Status"
              name="assetStatus"
              value={formData.assetStatus}
              onChange={handleChange}
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              label="Asset Location"
              name="assetLocation"
              value={formData.assetLocation}
              onChange={handleChange}
              sx={{ mt: 2 }}
            />
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ mt: 2 }}
            >
              Upload Asset Image
              <input hidden type="file" name="assetImage" />
            </Button>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={6} size={6}>
            <TextField
              fullWidth
              label="Enter Asset Name"
              name="assetName"
              value={formData.assetName}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              label="Manufacturer"
              name="manufacturer"
              value={formData.isMovable}
              onChange={handleChange}
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              label="Next Service Date"
              name="nextServiceDate"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formData.nextServiceDate}
              onChange={handleChange}
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              label="Asset Value"
              name="assetValue"
              type="number"
              value={formData.assetValue}
              onChange={handleChange}
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              label="QR Code"
              name="qrCode"
              value={formData.qrCode}
              onChange={handleChange}
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              label="Asset Category"
              name="assetCategory"
              value={formData.assetCategory}
              onChange={handleChange}
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              label="Asset Service Reminder"
              name="assetServiceReminder"
              value={formData.assetServiceReminder}
              onChange={handleChange}
              sx={{ mt: 2 }}
            />
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ mt: 2 }}
            >
              Upload AMC File
              <input hidden type="file" name="amcUpload" />
            </Button>
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="flex-end" sx={{ mt: 4 }}>
          <Button variant="contained" color="primary">
            Save
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default AssetMaster;