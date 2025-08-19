import React, { useEffect, useState } from "react";
import {
  Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from "@mui/material";
import { getAllAssetCheckinout, checkoutAsset, checkinAsset } from "../../Services/AssetService";
import { useSelector } from "react-redux";

const AssetCheckinout = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const officeId = useSelector((state) => state.user.officeId);

  const [selectedAsset, setSelectedAsset] = useState(null);

  // Checkout modal states
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [spares, setSpares] = useState([{ name: "", returnDate: "" }]);
  const [assigneeName, setAssignee] = useState("");
  const [purpose, setPurpose] = useState("");
  const [checkoutDateTime, setCheckoutDateTime] = useState("");
  const [outFrom, setOutFrom] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [approvedBy, setApprovedBy] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Check-in modal states
  const [checkinModalOpen, setCheckinModalOpen] = useState(false);
  const [checkinSpares, setCheckinSpares] = useState([{ name: "", returnDate: "" }]);
  const [returnedBy, setReturnedBy] = useState("");
  const [returnedFrom, setReturnedFrom] = useState("");
  const [checkinDateTime, setCheckinDateTime] = useState("");
  const [returnImageFile, setReturnImageFile] = useState(null);
  const [returnImagePreview, setReturnImagePreview] = useState(null);

  // Fetch assets from API
  const fetchAssets = async () => {
    try {
      const data = await getAllAssetCheckinout(officeId);
      setAssets(data || []);
    } catch (error) {
      console.error("Error loading assets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  // Handle image file change
  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (type === "checkout") {
      setImageFile(file);
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setImagePreview(null);
      }
    } else {
      setReturnImageFile(file);
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setReturnImagePreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setReturnImagePreview(null);
      }
    }
  };

  // Spare rows
  const handleAddSpare = () => setSpares([...spares, { name: "", returnDate: "" }]);
  const handleSpareChange = (index, field, value) => {
    const updated = [...spares];
    updated[index][field] = value;
    setSpares(updated);
  };

  const handleAddCheckinSpare = () => setCheckinSpares([...checkinSpares, { name: "", returnDate: "" }]);
  const handleCheckinSpareChange = (index, field, value) => {
    const updated = [...checkinSpares];
    updated[index][field] = value;
    setCheckinSpares(updated);
  };

  // Open checkout modal
  const handleCheckOutClick = (asset) => {
    setSelectedAsset(asset);
    setSpares([{ name: "", returnDate: "" }]);
    setAssignee("");
    setPurpose("");
    setCheckoutDateTime("");
    setOutFrom("");
    setSentTo("");
    setApprovedBy("");
    setImageFile(null);
    setCheckoutModalOpen(true);
  };

  // Checkout
  const handleCheckout = async () => {
    if (!selectedAsset) return;

    const sendData = async (image) => {
      await checkoutAsset({
        officeId,
        assetId: selectedAsset.id || selectedAsset.Id,
        assetName: selectedAsset.name || selectedAsset.Name,
        assigneeName,
        purpose,
        checkoutDateTime,
        outFrom,
        sentTo,
        approvedBy,
        imageOut: image,
        spareFields: spares.map(s => ({
          spareName: s.name,
          tentativeReturnDate: s.returnDate
        })),
      });
      alert("Spare checked out successfully!");
      setCheckoutModalOpen(false);
      fetchAssets();
    };

    if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result.split(",")[1];
        await sendData(base64Image);
      };
      reader.readAsDataURL(imageFile);
    } else {
      await sendData(null);
    }
  };

  // Open checkin modal
  const handleCheckInClick = (asset) => {
    setSelectedAsset(asset);
    setCheckinSpares([{ name: "", returnDate: "" }]);
    setReturnedBy("");
    setReturnedFrom("");
    setCheckinDateTime("");
    setReturnImageFile(null);
    setCheckinModalOpen(true);
  };

  // Checkin
  const handleCheckin = async () => {
    if (!selectedAsset) return;

    const sendData = async (image) => {
      await checkinAsset({
        officeId,
        assetId: selectedAsset.id || selectedAsset.Id,
        assetName: selectedAsset.name || selectedAsset.Name,
        returnedBy,
        returnedFrom,
        returnDateTime: checkinDateTime || null,
        imageIn: image,
        spareFields: checkinSpares.map(s => ({
          spareName: s.name,
          actualReturnDate: s.returnDate || null
        })),
      });
      alert("Spare checked in successfully!");
      setCheckinModalOpen(false);
      fetchAssets();
    };

    if (returnImageFile) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64ImageIn = reader.result.split(",")[1];
        await sendData(base64ImageIn);
      };
      reader.readAsDataURL(returnImageFile);
    } else {
      await sendData(null);
    }
  };

 // Helper: check if date is default/empty
const isDefaultDate = (dateStr) => {
  return !dateStr || dateStr === "1900-01-01T00:00:00";
};

// Show Check Out button if:
// 1) returnDate is default or <= today
const shouldShowCheckOut = (asset) => {
  if (isDefaultDate(asset.returnDate)) return true;

  const returnDateTime = new Date(asset.returnDate);
  const now = new Date();

  // Show Check Out if returnDateTime <= now
  return returnDateTime <= now;
};

// Show Check In button if:
// 1) checkOutDateTime exists and <= now
const shouldShowCheckIn = (asset) => {
  if (!asset.checkOutDateTime) return false;
  
  const checkOutDate = new Date(asset.checkOutDateTime);
  const now = new Date();
  
  return checkOutDate <= now;
};

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Spare List</Typography>
        <Button variant="contained" color="success">Download Report ⬇</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>Serial No.</b></TableCell>
              <TableCell><b>Asset ID</b></TableCell>
              <TableCell><b>Asset Name</b></TableCell>
              <TableCell><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assets.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{row.id || row.Id}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>
                  {shouldShowCheckIn(row) ? (
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => handleCheckInClick(row)}
                    >
                      Spare Check In
                    </Button>
                  ) : shouldShowCheckOut(row) ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleCheckOutClick(row)}
                    >
                      Spare Check Out
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Checkout Dialog */}
      <Dialog open={checkoutModalOpen} onClose={() => setCheckoutModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Check Out Spare</DialogTitle>
        <DialogContent>
          {selectedAsset && (
            <>
              <p><b>Asset ID:</b> {selectedAsset.id || selectedAsset.Id}</p>
              <p><b>Asset Name:</b> {selectedAsset.name || selectedAsset.Name}</p>

              {spares.map((spare, index) => (
                <Box key={index} mb={1}>
                  <TextField fullWidth label={`Spare Name ${index + 1}`} margin="dense"
                    value={spare.name} onChange={(e) => handleSpareChange(index, "name", e.target.value)} />
                  <TextField fullWidth label={`Tentative Date of Returning ${index + 1}`} type="date"
                    margin="dense" InputLabelProps={{ shrink: true }}
                    value={spare.returnDate} onChange={(e) => handleSpareChange(index, "returnDate", e.target.value)} />
                </Box>
              ))}
              <Button variant="outlined" size="small" sx={{ mt: 1 }} onClick={handleAddSpare}>Add Spare</Button>

              <TextField fullWidth label="Assignee Name" margin="dense" value={assigneeName} onChange={(e) => setAssignee(e.target.value)} />
              <TextField fullWidth label="Purpose Of Check Out" margin="dense" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
              <TextField fullWidth label="Check Out Date and Time" type="datetime-local"
                margin="dense" InputLabelProps={{ shrink: true }}
                value={checkoutDateTime} onChange={(e) => setCheckoutDateTime(e.target.value)} />
              <TextField fullWidth label="Out From" margin="dense" value={outFrom} onChange={(e) => setOutFrom(e.target.value)} />
              <TextField fullWidth label="Sent To" margin="dense" value={sentTo} onChange={(e) => setSentTo(e.target.value)} />
              <Box display="flex" alignItems="flex-start" mt={1} gap={2}>
                <Button variant="outlined" component="label">
                  Upload Image
                  <input hidden type="file" accept="image/*" onChange={(e) => handleImageChange(e, "checkout")} />
                </Button>
                {imagePreview && (
                  <Box component="img" src={imagePreview} alt="Preview"
                    sx={{ width: 100, height: 100, objectFit: "cover", borderRadius: 1, border: "1px solid #ccc" }} />
                )}
              </Box>
              <TextField fullWidth label="Approved By" margin="dense" value={approvedBy} onChange={(e) => setApprovedBy(e.target.value)} />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="primary" onClick={handleCheckout}>Check Out</Button>
          <Button onClick={() => setCheckoutModalOpen(false)} color="secondary">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Checkin Dialog */}
      <Dialog open={checkinModalOpen} onClose={() => setCheckinModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Check In Spare</DialogTitle>
        <DialogContent>
          {selectedAsset && (
            <>
              <p><b>Asset ID:</b> {selectedAsset.id || selectedAsset.Id}</p>
              <p><b>Asset Name:</b> {selectedAsset.name || selectedAsset.Name}</p>

              {checkinSpares.map((spare, index) => (
                <Box key={index} mb={1}>
                  <TextField fullWidth label={`Spare Name ${index + 1}`} margin="dense"
                    value={spare.name} onChange={(e) => handleCheckinSpareChange(index, "name", e.target.value)} />
                  <TextField fullWidth label={`Actual Return Date ${index + 1}`} type="date"
                    margin="dense" InputLabelProps={{ shrink: true }}
                    value={spare.returnDate} onChange={(e) => handleCheckinSpareChange(index, "returnDate", e.target.value)} />
                </Box>
              ))}
              <Button variant="outlined" size="small" sx={{ mt: 1 }} onClick={handleAddCheckinSpare}>Add Spare</Button>

              <TextField fullWidth label="Returned By" margin="dense" value={returnedBy} onChange={(e) => setReturnedBy(e.target.value)} />
              <TextField fullWidth label="Returned From" margin="dense" value={returnedFrom} onChange={(e) => setReturnedFrom(e.target.value)} />
              <TextField fullWidth label="Return Date and Time" type="datetime-local"
                margin="dense" InputLabelProps={{ shrink: true }}
                value={checkinDateTime} onChange={(e) => setCheckinDateTime(e.target.value)} />
              <Box display="flex" alignItems="flex-start" mt={1} gap={2}>
                <Button variant="outlined" component="label">
                  Upload Image
                  <input hidden type="file" accept="image/*" onChange={(e) => handleImageChange(e, "checkin")} />
                </Button>
                {returnImagePreview && (
                  <Box component="img" src={returnImagePreview} alt="Preview"
                    sx={{ width: 100, height: 100, objectFit: "cover", borderRadius: 1, border: "1px solid #ccc" }} />
                )}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="primary" onClick={handleCheckin}>Check In</Button>
          <Button onClick={() => setCheckinModalOpen(false)} color="secondary">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssetCheckinout;