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
  MenuItem,
  Autocomplete,
} from "@mui/material";
import { getAllAssetCheckinout, checkoutAsset, checkinAsset, getAssetDetails } from "../../Services/AssetService";
import { getAllEmployees } from "../../Services/EmployeeService";
import { getAllOffices } from "../../Services/OfficeService";
import { useSelector } from "react-redux";
import { getAssetSpares } from "../../Services/AssetSpare";

const AssetCheckinout = () => {
  const [assets, setAssets] = useState([]);
  const [openCheckout, setOpenCheckout] = useState(false);
  const [openCheckin, setOpenCheckin] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [offices, setOffices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [openView, setOpenView] = useState(false);
  const [viewAsset, setViewAsset] = useState(null);
  const [loadingView, setLoadingView] = useState(false);
  const [spareOptions, setSpareOptions] = useState([])
  const purposes = [
    "Purchase",
    "Maintenance",
    "Inspection",
    "Other",
  ];
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
    fetchOffice();
    fetchEmployees();
  }, []);

  const fetchAssets = async () => {
    const res = await getAllAssetCheckinout(officeId);
    setAssets(res || []);
  };

  const openViewDialog = async (assetId) => {
    setOpenView(true);
    setLoadingView(true);
    const data = await getAssetDetails(assetId);
    setViewAsset(data);
    setLoadingView(false);
  };

  const handleSpareKeyPress = (event, index) => {
    if (event.key === "Enter") {
      // Only add if current spareName is not empty
      if (spares[index].spareName.trim() !== "") {
        handleAddSpare();
      }
    }
  };

  const fetchOffice = async () => {
    const res = await getAllOffices();
    setOffices(res || []);
  };

  const fetchEmployees = async () => {
    const res = await getAllEmployees(officeId);
    setEmployees(res || []);
  };

  // Open checkout dialog
  const openCheckoutDialog = async (asset) => {
    setSelectedAsset(asset);
    setAssigneeName("");
    setPurpose("");
    setCheckoutDateTime(new Date().toISOString().slice(0, 16));
    setOutFrom("");
    setSentTo("");
    setApprovedBy("");
    setImageOut(null);
    setSpares([{ spareName: "", tentativeReturnDate: "", spareAmount: 0 }]);

    // Fetch spares for this asset
    const sparesData = await getAssetSpares(asset.id);
    setSpareOptions(sparesData.map(s => s.spareName));

    setOpenCheckout(true);
  };

  // Open checkin dialog
  const openCheckinDialog = async (asset) => {
    setSelectedAsset(asset);
    setReturnedBy("");
    setCheckinDateTime(new Date().toISOString().slice(0, 16));
    setImageIn(null);
    setReturnCondition("");

    // Prefill spares for checkin
    const prefilledSpares =
      asset.spareFields?.map((s) => ({
        spareName: s.spareName || "",
        tentativeReturnDate: s.tentativeReturnDate || "",
        returnDateTime: new Date().toISOString().slice(0, 16),
        spareAmount: s.spareAmount || 0,
      })) || [{ spareName: "", tentativeReturnDate: "", returnDateTime: "", spareAmount: 0 }];

    setCheckinSpares(prefilledSpares);

    // Fetch spares for this asset (optional for checkin dropdown)
    const sparesData = await getAssetSpares(asset.id);
    setSpareOptions(sparesData.map(s => s.spareName));

    setOpenCheckin(true);
  };

  // Spare handlers
  const handleAddSpare = () =>
    setSpares([...spares, { spareName: "", tentativeReturnDate: "", spareAmount: 0 }]);

  const handleAddCheckinSpare = () =>
    setCheckinSpares([...checkinSpares, { spareName: "", tentativeReturnDate: "", returnDateTime: "", spareAmount: 0 }]);


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

  const handleSpareChange = (index, field, value) => {
    const updated = [...spares];
    updated[index][field] = value;
    setSpares(updated);

    if (field === "spareName" && value && !spareOptions.includes(value)) {
      setSpareOptions([...spareOptions, value]);
    }
  };

  const handleCheckinSpareChange = (index, field, value) => {
    const updated = [...checkinSpares];
    updated[index][field] = value;
    setCheckinSpares(updated);

    if (field === "spareName" && value && !spareOptions.includes(value)) {
      setSpareOptions([...spareOptions, value]);
    }
  };

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>
        Asset Maintenance
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
                    <Button onClick={() => openViewDialog(asset.id)} variant="outlined" sx={{ mr: 1 }}>
                      View
                    </Button>
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

      <Dialog open={openView} onClose={() => setOpenView(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Asset Details</DialogTitle>
        <DialogContent dividers>
          {loadingView ? (
            <Typography>Loading...</Typography>
          ) : viewAsset && viewAsset.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><b>Asset ID</b></TableCell>
                    <TableCell><b>Asset Name</b></TableCell>
                    <TableCell><b>Checkout Date</b></TableCell>
                    <TableCell><b>Tentative Return</b></TableCell>
                    <TableCell><b>Returned Date</b></TableCell>
                    <TableCell><b>Assignee Name</b></TableCell>
                    <TableCell><b>Purpose</b></TableCell>
                    <TableCell><b>Out From</b></TableCell>
                    <TableCell><b>Sent To</b></TableCell>
                    <TableCell><b>Approved By</b></TableCell>
                    <TableCell><b>Checkout Image</b></TableCell>
                    <TableCell><b>Checkin Image</b></TableCell>
                    <TableCell><b>Spare Details</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {viewAsset.map((asset, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{asset.assetId}</TableCell>
                      <TableCell>{asset.name || "-"}</TableCell>
                      <TableCell>{asset.checkOutDateTime ? new Date(asset.checkOutDateTime).toLocaleString() : "-"}</TableCell>
                      <TableCell>{asset.tentativeReturnDate ? new Date(asset.tentativeReturnDate).toLocaleDateString() : "-"}</TableCell>
                      <TableCell>{asset.returnDateNullable ? new Date(asset.returnDateNullable).toLocaleString() : "-"}</TableCell>
                      <TableCell>{asset.assigneeName || "-"}</TableCell>
                      <TableCell>{asset.purpose || "-"}</TableCell>
                      <TableCell>{asset.outFrom || "-"}</TableCell>
                      <TableCell>{asset.sentTo || "-"}</TableCell>
                      <TableCell>{asset.approvedBy || "-"}</TableCell>
                      <TableCell>
                        {asset.imageOut ? (
                          <img
                            src={`data:image/jpeg;base64,${asset.imageOut}`}
                            alt="checkout"
                            style={{ width: 100, maxHeight: 100 }}
                          />
                        ) : "-"}
                      </TableCell>
                      <TableCell>
                        {asset.imageIn ? (
                          <img
                            src={`data:image/jpeg;base64,${asset.imageIn}`}
                            alt="checkin"
                            style={{ width: 100, maxHeight: 100 }}
                          />
                        ) : "-"}
                      </TableCell>
                      <TableCell>
                        {asset.spareName || asset.spareAmount ? (
                          <Box>
                            <Typography><b>Name:</b> {asset.spareName || "-"}</Typography>
                            <Typography><b>Amount:</b> {asset.spareAmount || "-"}</Typography>
                          </Box>
                        ) : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography>No data available</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenView(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog open={openCheckout} onClose={() => setOpenCheckout(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Checkout Asset</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Assignee Name" margin="dense" value={assigneeName} onChange={(e) => setAssigneeName(e.target.value)} />
          <Autocomplete
            freeSolo // Allows typing values not in the list
            options={purposes}
            value={purpose}
            onChange={(event, newValue) => {
              setPurpose(newValue || ""); // for selecting from dropdown
            }}
            onInputChange={(event, newInputValue) => {
              setPurpose(newInputValue); // for typing new value
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Purpose"
                margin="dense"
                fullWidth
              />
            )}
          />
          <TextField fullWidth type="datetime-local" label="Checkout Date & Time" InputLabelProps={{ shrink: true }} margin="dense" value={checkoutDateTime} onChange={(e) => setCheckoutDateTime(e.target.value)} />
          <TextField select fullWidth label="Out From" margin="dense" value={outFrom} onChange={(e) => setOutFrom(e.target.value)} >{offices.map((office) => (
            <MenuItem key={office.officeId} value={office.officeName}>
              {office.officeName}
            </MenuItem>
          ))}</TextField>
          <TextField fullWidth label="Sent To" margin="dense" value={sentTo} onChange={(e) => setSentTo(e.target.value)} />
          <TextField select fullWidth label="Approved By" margin="dense" value={approvedBy} onChange={(e) => setApprovedBy(e.target.value)} >{employees.map((employee) => (
            <MenuItem key={employee.employeeId} value={employee.employeeName}>
              {employee.employeeName}
            </MenuItem>
          ))}</TextField>

          <Box mt={2}>
            <input type="file" accept="image/*" onChange={handleCheckoutImageChange} />
          </Box>

          <Typography mt={2} variant="subtitle1">Spares</Typography>
          {spares.map((spare, index) => (
            <Box key={index} mb={1}>
              <Autocomplete
                freeSolo
                options={spareOptions}
                value={spare.spareName}
                onChange={(event, newValue) => handleSpareChange(index, "spareName", newValue || "")}
                onInputChange={(event, newInputValue) => handleSpareChange(index, "spareName", newInputValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={`Spare Name ${index + 1}`}
                    margin="dense"
                    fullWidth
                    onKeyDown={(e) => handleSpareKeyPress(e, index)}
                  />
                )}
              />
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
              <Autocomplete
                freeSolo
                options={spareOptions}
                value={spare.spareName}
                onChange={(event, newValue) => handleSpareChange(index, "spareName", newValue || "")}
                onInputChange={(event, newInputValue) => handleSpareChange(index, "spareName", newInputValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={`Spare Name ${index + 1}`}
                    margin="dense"
                    fullWidth
                    onKeyDown={(e) => handleSpareKeyPress(e, index)}
                  />
                )}
              />
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