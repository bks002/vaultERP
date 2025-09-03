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
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import {
  getAllAssetCheckinout,
  checkoutAsset,
  checkinAsset,
} from "../../Services/AssetService";
import { getAllEmployees } from "../../Services/EmployeeService";
import { getAllOffices } from "../../Services/OfficeService";
import { getAssetSpares } from "../../Services/AssetSpare";
import { useSelector } from "react-redux";

const AssetMaintenance = () => {
  const [assets, setAssets] = useState([]);
  const [openCheckout, setOpenCheckout] = useState(false);
  const [openCheckin, setOpenCheckin] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [offices, setOffices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [spares, setSpares] = useState([]);
  const [checkinSpares, setCheckinSpares] = useState([]);
  const [spareOptions, setSpareOptions] = useState([]);
  const [spareOptionsData, setSpareOptionsData] = useState([]);
  const [purpose, setPurpose] = useState("");
  const [checkoutDateTime, setCheckoutDateTime] = useState("");
  const [checkinDateTime, setCheckinDateTime] = useState("");
  const [assigneeName, setAssigneeName] = useState("");
  const [returnedBy, setReturnedBy] = useState("");
  const [outFrom, setOutFrom] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [approvedBy, setApprovedBy] = useState("");
  const [returnCondition, setReturnCondition] = useState("");
  const [imageOut, setImageOut] = useState(null);
  const [imageIn, setImageIn] = useState(null);

  const officeId = useSelector((state) => state.user.officeId);
  const purposes = ["Purchase", "Maintenance", "Inspection", "Other"];
  const [openReport, setOpenReport] = useState(false);
  const [reportAsset, setReportAsset] = useState(null);
  const [repairSpareOptions, setRepairSpareOptions] = useState([]);

  const openReportDialog = async (asset) => {
    setReportAsset(asset);
    setOpenReport(true);
  };

  // Fetch initial data
  useEffect(() => {
    fetchAssets();
    fetchOffices();
    fetchEmployees();
  }, []);

  const fetchAssets = async () => {
    const res = await getAllAssetCheckinout(officeId);
    setAssets(res || []);
  };

  const fetchOffices = async () => {
    const res = await getAllOffices();
    setOffices(res || []);
  };

  const fetchEmployees = async () => {
    const res = await getAllEmployees(officeId);
    setEmployees(res || []);
  };

  // Watch spares and update SentTo automatically for under-warranty items
  useEffect(() => {
    if (!spares.length || !spareOptionsData.length) return;
    spares.forEach((spare) => {
      const selectedSpare = spareOptionsData.find((s) => s.spareName === spare.spareName);
      if (selectedSpare?.warrantyExpiry && new Date(selectedSpare.warrantyExpiry) >= new Date()) {
        if (selectedSpare.vendorName) setSentTo(selectedSpare.vendorName);
      }
    });
  }, [spares, spareOptionsData]);

  const openCheckoutDialog = async (asset) => {
    setSelectedAsset(asset);
    setAssigneeName("");
    setPurpose("");
    setCheckoutDateTime(new Date().toISOString().slice(0, 16));
    setOutFrom("");
    setSentTo("");
    setApprovedBy("");
    setImageOut(null);
    setSpares([{ spareName: "", tentativeReturnDate: "", spareAmount: 0, repairNeeded: false, scrapOldValue: 0, isScrap: false }]);

    const sparesData = await getAssetSpares(asset.id);
    setSpareOptionsData(sparesData);
    setSpareOptions(sparesData.map((s) => s.spareName));

    setOpenCheckout(true);
  };

  const openCheckinDialog = async (asset) => {
    setSelectedAsset(asset);

    // if spare was under warranty (came from vendor), prefill ReturnedBy
    if (asset.sentTo) {
      setReturnedBy(asset.sentTo);
    } else {
      setReturnedBy("");
    }

    setCheckinDateTime(new Date().toISOString().slice(0, 16));
    setImageIn(null);
    setReturnCondition("");

    const prefilledSpares =
      asset.spareFields?.map((s) => ({
        spareName: s.spareName || "",
        returnDateTime: new Date().toISOString().slice(0, 16),
        spareAmount: s.spareAmount || 0,
        repairNeeded: s.repairNeeded || false,
        scrapOldValue: s.scrapOldSpareValue || 0,
        isScrap: s.isScrap || false,
      })) || [
        {
          spareName: "",
          returnDateTime: "",
          spareAmount: 0,
          repairNeeded: false,
          scrapOldValue: 0,
          isScrap: false,
        },
      ];

    setCheckinSpares(prefilledSpares);

    const sparesData = await getAssetSpares(asset.id);
    setSpareOptionsData(sparesData);
    setOpenCheckin(true);
  };

  const handleAddSpare = () => {
    setSpares([...spares, { spareName: "", tentativeReturnDate: "", spareAmount: 0, repairNeeded: false, scrapOldValue: 0, isScrap: false }]);
  };

  const handleAddCheckinSpare = () => {
    setCheckinSpares([
      ...checkinSpares,
      {
        spare_id: null,         // will be assigned by backend
        spare_code: "",         // user can enter
        spareName: "",          // maps to spare_name
        part_number: "",
        category: "",
        specification: "",
        unit_of_measure: "Piece",
        current_stock: 0,
        reorder_level: 0,
        reorder_quantity: 0,
        location: "",
        linked_asset_id: selectedAsset?.id || null,
        vendor_name: "",
        purchase_rate: 0,
        average_cost: 0,
        lead_time_days: 0,
        criticality: "Medium",
        warranty_expiry: "",
        remarks: "",
        isNew: true,           // mark as new
      }
    ]);
  };

  const handleSpareChange = (index, field, value, type) => {
    const list = type === "checkout" ? [...spares] : [...checkinSpares];
    list[index][field] = value;
    type === "checkout" ? setSpares(list) : setCheckinSpares(list);
    if (field === "spareName" && value && !spareOptions.includes(value)) {
      setSpareOptions([...spareOptions, value]);
    }
  };

  const handleFileToBase64 = (file, setter) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result.split(",")[1];
      setter(base64String);
    };
    reader.readAsDataURL(file);
  };

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
      spareFields: spares.map((s) => {
        // find full spare info from API
        const apiSpare = spareOptionsData.find((x) => x.spareName === s.spareName) || {};

        return {
          // user fields (override API if filled)
          spareName: s.spareName || apiSpare.spareName,
          warrantyExpiry: s.warrantyExpiry
            ? new Date(s.warrantyExpiry + "T00:00:00Z").toISOString()
            : apiSpare.warrantyExpiry
              ? new Date(apiSpare.warrantyExpiry).toISOString()
              : null,
          tentativeReturnDate: s.tentativeReturnDate
            ? new Date(s.tentativeReturnDate + "T00:00:00Z").toISOString()
            : null,
          spareAmount: parseInt(s.spareAmount || 0, 10),

          // new fields merged from API
          spareCode: apiSpare.spareCode || "",
          partNumber: apiSpare.partNumber || "",
          category: apiSpare.category || "",
          specification: apiSpare.specification || "",
          unitOfMeasure: apiSpare.unitOfMeasure || "",
          vendorName: apiSpare.vendorName || "",
          purchaseRate: apiSpare.purchaseRate || 0,
          averageCost: apiSpare.averageCost || 0,
          leadTimeDays: apiSpare.leadTimeDays || 0,
          criticality: apiSpare.criticality || "",
          remarks: apiSpare.remarks || "",

          // user controlled flags
          repairNeeded: s.repairNeeded,
          scrapOldSpareValue: parseInt(s.scrapOldValue || 0, 10),
          isScrap: s.isScrap,
          isNew: s.isNew || false,
        };
      }),
    };

    await checkoutAsset(payload);
    setOpenCheckout(false);
    fetchAssets();
  };

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
        spare_id: s.spare_id,
        spare_code: s.spare_code,
        spareName: s.spareName,
        part_number: s.part_number,
        category: s.category,
        specification: s.specification,
        unit_of_measure: s.unit_of_measure,
        current_stock: s.current_stock,
        reorder_level: s.reorder_level,
        reorder_quantity: s.reorder_quantity,
        location: s.location,
        linked_asset_id: selectedAsset.id,
        vendor_name: s.vendor_name,
        purchase_rate: s.purchase_rate,
        average_cost: s.average_cost,
        lead_time_days: s.lead_time_days,
        criticality: s.criticality,
        warranty_expiry: s.warranty_expiry,
        remarks: s.remarks,
        spareAmount: s.spareAmount,
        repairNeeded: s.repairNeeded,
        isScrap: s.isScrap,
        isNew: s.isNew || false,
      })),
    };

    await checkinAsset(payload);

    // Optionally, persist new spares in main spare table
    const newSpares = checkinSpares.filter((s) => s.isNew);
    if (newSpares.length) {
      await addNewSparesToSpareTable(newSpares);
    }

    setOpenCheckin(false);
    fetchAssets();
  };

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>Asset Maintenance</Typography>

      {/* Assets Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Asset ID</TableCell>
              <TableCell>Asset Name</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assets.map((asset) => {
              const now = new Date();
              const checkoutTime = asset.checkOutDateTime ? new Date(asset.checkOutDateTime) : null;
              const returnTime = asset.returnDate ? new Date(asset.returnDate) : null;
              const showCheckinButton = checkoutTime && checkoutTime <= now && (!returnTime || returnTime < now);
              const showCheckoutButton = !checkoutTime || (returnTime && returnTime <= now);

              return (
                <TableRow key={asset.id}>
                  <TableCell>{asset.id}</TableCell>
                  <TableCell>{asset.name}</TableCell>
                  <TableCell>
                    {showCheckinButton && <Button variant="outlined" onClick={() => openCheckinDialog(asset)}>Checkin</Button>}
                    {showCheckoutButton && <Button variant="contained" onClick={() => openCheckoutDialog(asset)} disabled={returnTime && returnTime > now}>Checkout</Button>}
                    <Button
                      variant="text"
                      color="secondary"
                      onClick={() => openReportDialog(asset)}
                    >
                      View
                    </Button>
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
          <Autocomplete freeSolo options={purposes} value={purpose} onChange={(e, newVal) => setPurpose(newVal || "")} onInputChange={(e, newVal) => setPurpose(newVal)} renderInput={(params) => <TextField {...params} label="Purpose" margin="dense" fullWidth />} />
          <TextField fullWidth type="datetime-local" label="Checkout Date & Time" margin="dense" InputLabelProps={{ shrink: true }} value={checkoutDateTime} onChange={(e) => setCheckoutDateTime(e.target.value)} />
          <TextField select fullWidth label="Out From" margin="dense" value={outFrom} onChange={(e) => setOutFrom(e.target.value)}>
            {offices.map((office) => <MenuItem key={office.officeId} value={office.officeName}>{office.officeName}</MenuItem>)}
          </TextField>
          <TextField fullWidth label="Sent To" margin="dense" value={sentTo} onChange={(e) => setSentTo(e.target.value)} />
          <TextField select fullWidth label="Approved By" margin="dense" value={approvedBy} onChange={(e) => setApprovedBy(e.target.value)}>
            {employees.map((emp) => <MenuItem key={emp.employeeId} value={emp.employeeName}>{emp.employeeName}</MenuItem>)}
          </TextField>
          <Box mt={2}><input type="file" accept="image/*" onChange={(e) => handleFileToBase64(e.target.files[0], setImageOut)} /></Box>

          <Typography mt={2} variant="subtitle1">Spares</Typography>
          {spares.map((spare, index) => {
            const selectedSpare = spareOptionsData.find((s) => s.spareName === spare.spareName);
            const isUnderWarranty = selectedSpare?.warrantyExpiry && new Date(selectedSpare.warrantyExpiry) >= new Date();
            const disableScrapFields = isUnderWarranty || spare.repairNeeded; // <-- new logic

            return (
              <Box key={index} mb={1} borderBottom="1px solid #ddd" pb={1}>
                <Autocomplete
                  freeSolo
                  options={spareOptions}
                  value={spare.spareName || ""}
                  onChange={(e, newVal) => handleSpareChange(index, "spareName", newVal || "", "checkout")}
                  onInputChange={(e, newVal) => handleSpareChange(index, "spareName", newVal, "checkout")}
                  renderInput={(params) => <TextField {...params} label={`Spare Name ${index + 1}`} margin="dense" fullWidth />}
                />

                {selectedSpare?.warrantyExpiry && (
                  <Typography variant="body2" color={isUnderWarranty ? "primary" : "error"}>
                    Warranty Expiry: {new Date(selectedSpare.warrantyExpiry).toLocaleDateString()}
                  </Typography>
                )}

                <TextField
                  fullWidth
                  type="date"
                  label="Tentative Return Date"
                  margin="dense"
                  InputLabelProps={{ shrink: true }}
                  value={spare.tentativeReturnDate}
                  onChange={(e) => handleSpareChange(index, "tentativeReturnDate", e.target.value, "checkout")}
                />

                <TextField
                  fullWidth
                  type="number"
                  label="Amount"
                  margin="dense"
                  value={spare.spareAmount}
                  onChange={(e) => handleSpareChange(index, "spareAmount", e.target.value, "checkout")}
                  disabled={isUnderWarranty}  // still disabled if under warranty
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={spare.repairNeeded}
                      onChange={(e) => handleSpareChange(index, "repairNeeded", e.target.checked, "checkout")}
                      disabled={isUnderWarranty}  // still disabled if under warranty
                    />
                  }
                  label="Repair Needed"
                />

                <TextField
                  fullWidth
                  type="number"
                  label="Scrap Old Value"
                  margin="dense"
                  value={spare.scrapOldValue}
                  onChange={(e) => handleSpareChange(index, "scrapOldValue", e.target.value, "checkout")}
                  disabled={disableScrapFields}  // <-- conditional
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={spare.isScrap}
                      onChange={(e) => handleSpareChange(index, "isScrap", e.target.checked, "checkout")}
                      disabled={disableScrapFields}  // <-- conditional
                    />
                  }
                  label="Is Scrap"
                />
              </Box>
            );
          })}
          <Button onClick={handleAddSpare}>+ Add Spare</Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCheckout(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCheckoutSubmit}>Checkout</Button>
        </DialogActions>
      </Dialog>

      {/* Checkin Dialog */}
      <Dialog open={openCheckin} onClose={() => setOpenCheckin(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Checkin Asset</DialogTitle>
        <DialogContent>
          {/* Basic Fields */}
          <TextField
            fullWidth
            label="Returned By"
            margin="dense"
            value={returnedBy}
            onChange={(e) => setReturnedBy(e.target.value)}
          />
          <TextField
            fullWidth
            type="datetime-local"
            label="Checkin Date & Time"
            margin="dense"
            InputLabelProps={{ shrink: true }}
            value={checkinDateTime}
            onChange={(e) => setCheckinDateTime(e.target.value)}
          />
          <TextField
            fullWidth
            label="Return Condition"
            margin="dense"
            value={returnCondition}
            onChange={(e) => setReturnCondition(e.target.value)}
          />
          <Box mt={2}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileToBase64(e.target.files[0], setImageIn)}
            />
          </Box>

          {/* Spares Section */}
          <Typography mt={2} variant="subtitle1">Spares</Typography>
          {checkinSpares.map((spare, index) => {
            const selectedSpare = spareOptionsData.find((s) => s.spareName === spare.spareName);
            const isUnderWarranty = selectedSpare?.warrantyExpiry && new Date(selectedSpare.warrantyExpiry) >= new Date();

            // disable fields if old spare is under warranty or repair-needed
            const disableFields = (isUnderWarranty || spare.repairNeeded) && !spare.isNew;

            return (
              <Box key={index} mb={2} p={2} border="1px solid #ddd" borderRadius={2}>
                {/* Spare Name */}
                <Autocomplete
                  freeSolo
                  options={spareOptionsData.map((s) => s.spareName)}
                  value={spare.spareName || ""}
                  onChange={(e, newVal) =>
                    handleSpareChange(index, "spareName", newVal || "", "checkin")
                  }
                  onInputChange={(e, newVal) =>
                    handleSpareChange(index, "spareName", newVal, "checkin")
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={`Spare Name ${index + 1}`}
                      margin="dense"
                      fullWidth
                      disabled={disableFields}
                    />
                  )}
                />

                {/* Warranty Info */}
                {selectedSpare?.warrantyExpiry ? (
                  <Typography variant="body2" color={isUnderWarranty ? "primary" : "error"}>
                    Warranty Expiry: {new Date(selectedSpare.warrantyExpiry).toLocaleDateString()}
                  </Typography>
                ) : (
                  <TextField
                    fullWidth
                    type="date"
                    label="Warranty Expiry"
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                    value={spare.warrantyExpiry || ""}
                    onChange={(e) => handleSpareChange(index, "warrantyExpiry", e.target.value, "checkin")}
                    disabled={disableFields}
                  />
                )}

                {/* Vendor */}
                <TextField
                  fullWidth
                  label="Vendor Name"
                  margin="dense"
                  value={spare.vendorName || ""}
                  onChange={(e) => handleSpareChange(index, "vendorName", e.target.value, "checkin")}
                  disabled={disableFields}
                />

                {/* Amount */}
                <TextField
                  fullWidth
                  type="number"
                  label="Spare Amount"
                  margin="dense"
                  value={spare.spareAmount || 0}
                  onChange={(e) => handleSpareChange(index, "spareAmount", e.target.value, "checkin")}
                  disabled={disableFields}
                />

                {/* Repair Needed */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={spare.repairNeeded || false}
                      onChange={(e) => handleSpareChange(index, "repairNeeded", e.target.checked, "checkin")}
                      disabled={isUnderWarranty}
                    />
                  }
                  label="Repair Needed"
                />

                {/* Scrap */}
                <TextField
                  fullWidth
                  type="number"
                  label="Scrap Old Spare Value"
                  margin="dense"
                  value={spare.scrapOldSpareValue || 0}
                  onChange={(e) => handleSpareChange(index, "scrapOldSpareValue", e.target.value, "checkin")}
                  disabled={disableFields}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={spare.isScrap || false}
                      onChange={(e) => handleSpareChange(index, "isScrap", e.target.checked, "checkin")}
                      disabled={disableFields}
                    />
                  }
                  label="Is Scrap"
                />
              </Box>
            );
          })}
          <Button onClick={handleAddCheckinSpare}>+ Add Spare</Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCheckin(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCheckinSubmit}>Checkin</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openReport}
        onClose={() => setOpenReport(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Asset Maintenance Report</DialogTitle>
        <DialogContent>
          {reportAsset ? (
            <>
              <Typography variant="h6">Asset Details</Typography>
              <Typography>ID: {reportAsset.id}</Typography>
              <Typography>Name: {reportAsset.name}</Typography>
              <Typography>
                Checked Out:{" "}
                {reportAsset.checkOutDateTime
                  ? new Date(reportAsset.checkOutDateTime).toLocaleString()
                  : "N/A"}
              </Typography>
              <Typography>
                Returned:{" "}
                {reportAsset.returnDate
                  ? new Date(reportAsset.returnDate).toLocaleString()
                  : "N/A"}
              </Typography>

              <Typography mt={2} variant="h6">
                Spares History
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Spare Name</TableCell>
                    <TableCell>Warranty Expiry</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Repair Needed</TableCell>
                    <TableCell>Is Scrap</TableCell>
                    <TableCell>Return Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportAsset.spareFields && reportAsset.spareFields.length > 0 ? (
                    reportAsset.spareFields.map((s, i) => (
                      <TableRow key={i}>
                        <TableCell>{s.spareName}</TableCell>
                        <TableCell>
                          {s.warrantyExpiry
                            ? new Date(s.warrantyExpiry).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell>{s.spareAmount}</TableCell>
                        <TableCell>{s.repairNeeded ? "Yes" : "No"}</TableCell>
                        <TableCell>{s.isScrap ? "Yes" : "No"}</TableCell>
                        <TableCell>
                          {s.tentativeReturnDate
                            ? new Date(s.tentativeReturnDate).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No spares history available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </>
          ) : (
            <Typography>No data available</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReport(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssetMaintenance;
