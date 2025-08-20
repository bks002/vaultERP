import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { getAllAssetCheckinout, checkoutAsset, checkinAsset } from "../../Services/AssetService";
import { useSelector } from "react-redux";

const AssetCheckinout = () => {
  const [assets, setAssets] = useState([]);
  const [openCheckout, setOpenCheckout] = useState(false);
  const [openCheckin, setOpenCheckin] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Checkout form states
  const [assigneeName, setAssigneeName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [checkoutDateTime, setCheckoutDateTime] = useState("");
  const [outFrom, setOutFrom] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [approvedBy, setApprovedBy] = useState("");
  const [imageOut, setImageOut] = useState(null);
  const [spares, setSpares] = useState([]);

  // Checkin form states
  const [returnedBy, setReturnedBy] = useState("");
  const [checkinDateTime, setCheckinDateTime] = useState("");
  const [imageIn, setImageIn] = useState(null);
  const [returnCondition, setReturnCondition] = useState("");
  const [checkinSpares, setCheckinSpares] = useState([]);

  const officeId = useSelector((state) => state.user.officeId);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    const res = await getAllAssetCheckinout(officeId);
    setAssets(res || []);
  };

  // Open checkout dialog
  const openCheckoutDialog = (asset) => {
    setSelectedAsset(asset);
    setAssigneeName("");
    setPurpose("");
    setCheckoutDateTime(new Date().toISOString().slice(0, 16)); // for form input
    setOutFrom("");
    setSentTo("");
    setApprovedBy("");
    setImageOut(null);
    setSpares([{ spareName: "", tentativeReturnDate: "", spareAmount: 0 }]);
    setOpenCheckout(true);
  };

  // Open checkin dialog
  const openCheckinDialog = (asset) => {
    setSelectedAsset(asset);
    setReturnedBy("");
    setCheckinDateTime(new Date().toISOString().slice(0, 16));
    setImageIn(null);
    setReturnCondition("");

    const prefilledSpares =
      asset.spareFields?.map((s) => ({
        spareName: s.spareName || "",
        tentativeReturnDate: s.tentativeReturnDate || "",
        returnDateTime: new Date().toISOString().slice(0, 16),
        spareAmount: s.spareAmount || 0,
      })) || [{ spareName: "", tentativeReturnDate: "", returnDateTime: "", spareAmount: 0 }];

    setCheckinSpares(prefilledSpares);
    setOpenCheckin(true);
  };

  // Spare handlers
  const handleAddSpare = () =>
    setSpares([...spares, { spareName: "", tentativeReturnDate: "", spareAmount: 0 }]);
  const handleSpareChange = (index, field, value) => {
    const updated = [...spares];
    updated[index][field] = value;
    setSpares(updated);
  };

  const handleAddCheckinSpare = () =>
    setCheckinSpares([...checkinSpares, { spareName: "", tentativeReturnDate: "", returnDateTime: "", spareAmount: 0 }]);
  const handleCheckinSpareChange = (index, field, value) => {
    const updated = [...checkinSpares];
    updated[index][field] = value;
    setCheckinSpares(updated);
  };

  // File inputs
  const handleFileToBase64 = (file, setter) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        const base64String = result.includes(",") ? result.split(",")[1] : result;
        setter(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCheckoutImageChange = (e) => handleFileToBase64(e.target.files[0], setImageOut);
  const handleCheckinImageChange = (e) => handleFileToBase64(e.target.files[0], setImageIn);

  // Checkout submit
  const handleCheckoutSubmit = async () => {
    if (!selectedAsset) return;

    const payload = {
      officeId,
      assetId: selectedAsset.id,
      assetName: selectedAsset.name,
      assigneeName,
      purpose,
      checkOutDateTime: new Date(checkoutDateTime).toISOString(),
      outFrom,
      sentTo,
      approvedBy,
      imageOut,
      spareFields: spares.map((s) => ({
        spareName: s.spareName,
        tentativeReturnDate: s.tentativeReturnDate ? new Date(s.tentativeReturnDate + "T00:00:00Z").toISOString() : null,
        spareAmount: parseInt(s.spareAmount || 0, 10),
      })),
    };

    await checkoutAsset(payload);
    setOpenCheckout(false);
    fetchAssets();
  };

  // Checkin submit
  const handleCheckinSubmit = async () => {
    if (!selectedAsset) return;

    const payload = {
      assetId: selectedAsset.id,
      assetName: selectedAsset.name,
      checkOutDateTime: selectedAsset.checkOutDateTime,
      returnedBy,
      returnDateTime: new Date(checkinDateTime).toISOString(),
      imageIn,
      returnCondition,
      spareFields: checkinSpares.map((s) => ({
        spareName: s.spareName,
        tentativeReturnDate: selectedAsset.tentativeReturnDate,
        returnDateTime: new Date(s.returnDateTime).toISOString(),
        spareAmount: parseInt(s.spareAmount || 0, 10),
      })),
    };

    await checkinAsset(payload);
    setOpenCheckin(false);
    fetchAssets();
  };

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>
        Asset Spare Repair
      </Typography>

      {/* Assets Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Asset ID</TableCell>
              <TableCell>Asset Name</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assets.map((asset) => {
              const now = new Date();
              const checkoutTime = asset.checkOutDateTime ? new Date(asset.checkOutDateTime) : null;
              const returnTime = asset.returnDate ? new Date(asset.returnDate) : null;

              const showCheckinButton =
                checkoutTime && checkoutTime <= now && (!returnTime || asset.returnDateNullable < now);

              const showCheckoutButton =
                !checkoutTime || (returnTime && returnTime <= now);

              return (
                <TableRow key={asset.id}>
                  <TableCell>{asset.id}</TableCell>
                  <TableCell>{asset.name}</TableCell>
                  <TableCell>
                    {showCheckinButton ? (
                      <Button
                        variant="outlined"
                        onClick={() => openCheckinDialog(asset)}
                      >
                        Spare Check In
                      </Button>
                    ) : showCheckoutButton ? (
                      <Button
                        variant="contained"
                        onClick={() => openCheckoutDialog(asset)}
                        disabled={returnTime && returnTime > now} // disable until return time passes
                      >
                        Spare Check Out
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Checkout Dialog */}
      <Dialog open={openCheckout} onClose={() => setOpenCheckout(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Checkout Asset</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Assignee Name" margin="dense" value={assigneeName} onChange={(e) => setAssigneeName(e.target.value)} />
          <TextField fullWidth label="Purpose" margin="dense" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
          <TextField fullWidth type="datetime-local" label="Checkout Date & Time" InputLabelProps={{ shrink: true }} margin="dense" value={checkoutDateTime} onChange={(e) => setCheckoutDateTime(e.target.value)} />
          <TextField fullWidth label="Out From" margin="dense" value={outFrom} onChange={(e) => setOutFrom(e.target.value)} />
          <TextField fullWidth label="Sent To" margin="dense" value={sentTo} onChange={(e) => setSentTo(e.target.value)} />
          <TextField fullWidth label="Approved By" margin="dense" value={approvedBy} onChange={(e) => setApprovedBy(e.target.value)} />

          <Box mt={2}>
            <input type="file" accept="image/*" onChange={handleCheckoutImageChange} />
          </Box>

          <Typography mt={2} variant="subtitle1">Spares</Typography>
          {spares.map((spare, index) => (
            <Box key={index} mb={1}>
              <TextField fullWidth label={`Spare Name ${index + 1}`} margin="dense" value={spare.spareName} onChange={(e) => handleSpareChange(index, "spareName", e.target.value)} />
              <TextField fullWidth type="date" label={`Tentative Return Date ${index + 1}`} InputLabelProps={{ shrink: true }} margin="dense" value={spare.tentativeReturnDate} onChange={(e) => handleSpareChange(index, "tentativeReturnDate", e.target.value)} />
              <TextField fullWidth type="number" label={`Amount ${index + 1}`} margin="dense" value={spare.spareAmount} onChange={(e) => handleSpareChange(index, "spareAmount", e.target.value)} />
            </Box>
          ))}
          <Button onClick={handleAddSpare}>+ Add Spare</Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCheckout(false)}>Cancel</Button>
          <Button onClick={handleCheckoutSubmit} variant="contained">Checkout</Button>
        </DialogActions>
      </Dialog>

      {/* Checkin Dialog */}
      <Dialog open={openCheckin} onClose={() => setOpenCheckin(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Checkin Asset</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Returned By" margin="dense" value={returnedBy} onChange={(e) => setReturnedBy(e.target.value)} />
          <TextField fullWidth type="datetime-local" label="Return Date & Time" InputLabelProps={{ shrink: true }} margin="dense" value={checkinDateTime} onChange={(e) => setCheckinDateTime(e.target.value)} />
          <TextField fullWidth label="Return Condition" margin="dense" value={returnCondition} onChange={(e) => setReturnCondition(e.target.value)} />

          <Box mt={2}>
            <input type="file" accept="image/*" onChange={handleCheckinImageChange} />
          </Box>

          <Typography mt={2} variant="subtitle1">Returned Spares</Typography>
          {checkinSpares.map((spare, index) => (
            <Box key={index} mb={1}>
              <TextField fullWidth label={`Spare Name ${index + 1}`} margin="dense" value={spare.spareName} onChange={(e) => handleCheckinSpareChange(index, "spareName", e.target.value)} />
              <TextField fullWidth type="datetime-local" label={`Actual Return Date ${index + 1}`} InputLabelProps={{ shrink: true }} margin="dense" value={spare.returnDateTime} onChange={(e) => handleCheckinSpareChange(index, "returnDateTime", e.target.value)} />
              <TextField fullWidth type="number" label={`Amount ${index + 1}`} margin="dense" value={spare.spareAmount} onChange={(e) => handleCheckinSpareChange(index, "spareAmount", e.target.value)} />
            </Box>
          ))}
          <Button onClick={handleAddCheckinSpare}>+ Add Spare</Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCheckin(false)}>Cancel</Button>
          <Button onClick={handleCheckinSubmit} variant="contained">Checkin</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssetCheckinout;