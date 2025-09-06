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
  IconButton
} from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";
import {
  getAllAssetCheckinout,
  checkoutAsset,
  checkinAsset,
  approveAssetCheckout,
  approveAssetCheckin
} from "../../Services/AssetService";
import { getAllEmployees } from "../../Services/EmployeeService";
import { getAllOffices } from "../../Services/OfficeService";
import { getAssetSpares, getAllAssetSparesByName } from "../../Services/AssetSpare";
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
    // Prefill ReturnedBy with asset.sentTo (from API)
    setReturnedBy(asset.sentTo || "");
    setCheckinDateTime(new Date().toISOString().slice(0, 16));
    setImageIn(null);
    setReturnCondition(asset.returnCondition || "");
    const spareFields = await getAllAssetSparesByName(asset.spareName);
    setSpareOptionsData(spareFields);
    // Prefill spares with all available details from API
    const prefilledSpares =
      spareOptionsData?.map((s) => ({
        spare_id: s.spareId || null,
        spare_code: s.spareCode || "",
        spareName: s.spareName || "",
        part_number: s.partNumber || "",
        category: s.category || "",
        specification: s.specification || "",
        unit_of_measure: s.unitOfMeasure || "Piece",
        current_stock: s.currentStock || 0,
        reorder_level: s.reorderLevel || 0,
        reorder_quantity: s.reorderQuantity || 0,
        location: s.location || "",
        linked_asset_id: asset.linkedAssetId,
        vendor_name: s.vendorName || "",
        purchase_rate: s.purchaseRate || 0,
        average_cost: s.averageCost || 0,
        lead_time_days: s.leadTimeDays || 0,
        criticality: s.criticality || "Medium",
        warranty_expiry: s.warrantyExpiry || "",
        remarks: s.remarks || "",
        // return-specific fields
        returnDateTime: new Date().toISOString().slice(0, 16),
        spareAmount: s.spareAmount || 0,
        repairNeeded: s.repairNeeded || false,
        scrapOldSpareValue: s.scrapOldSpareValue || 0,
        isScrap: s.isScrap || false,
        isNew: false, // existing spare
      })) || [
        {
          spare_id: null,
          spare_code: "",
          spareName: "",
          part_number: "",
          category: "",
          specification: "",
          unit_of_measure: "Piece",
          current_stock: 0,
          reorder_level: 0,
          reorder_quantity: 0,
          location: "",
          linked_asset_id: asset.id,
          vendor_name: "",
          purchase_rate: 0,
          average_cost: 0,
          lead_time_days: 0,
          criticality: "Medium",
          warranty_expiry: "",
          remarks: "",
          returnDateTime: "",
          spareAmount: 0,
          repairNeeded: false,
          scrapOldSpareValue: 0,
          isScrap: false,
          isNew: true,
        },
      ];

    setCheckinSpares(prefilledSpares);
    // const sparesData = await getAssetSpares(asset.id);
    // setSpareOptionsData(sparesData);
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

  const rows =
    reportAsset && reportAsset.spareFields && reportAsset.spareFields.length > 0
      ? reportAsset.spareFields
      : [null];

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
      assetId: selectedAsset.id,
      assetName: selectedAsset.name,
      assigneeName,
      purpose,
      checkOutDateTime: new Date(checkoutDateTime).toISOString(),
      outFrom,
      sentTo,
      imageOut, // optional
      approvedBy,
      checkoutApprovalStatus: "Pending", // <--- send for approval
      checkoutApprovedBy: "",           // leave blank until approved
      checkoutApprovalDateTime: null,
      spareFields: spares.map((s) => ({
        spareName: s.spareName || "",
        isNew: s.isNew || true,
        tentativeReturnDate: s.tentativeReturnDate ? new Date(s.tentativeReturnDate).toISOString() : null,
        // do NOT send amounts, repairNeeded, scrap info yet
        spareCode: "",
        partNumber: "",
        category: "",
        specification: "",
        unitOfMeasure: "",
        currentStock: 0,
        vendorName: "",
        purchaseRate: 0,
        averageCost: 0,
        leadTimeDays: 0,
        criticality: "",
        warrantyExpiry: s.warrantyExpiry || null,
        remarks: ""
      }))
    };

    await checkoutAsset(payload);
    setOpenCheckout(false);
    fetchAssets(); // table will update with pending request
  };

  const handleCheckinSubmit = async () => {
    if (!selectedAsset) return;

    const payload = {
      checkoutId: selectedAsset.checkoutId,
      assetId: selectedAsset.assetId,
      returnedBy,
      returnDateTime: new Date(checkinDateTime).toISOString(),
      returnCondition,
      imageIn,
      returnApprovalStatus: "Pending",
      returnApprovedBy: selectedAsset.approvedBy || "",
      returnApprovalDateTime: null,
      SpareFields: checkinSpares.map(s => ({
        spareName: s.spareName,
        spareAmount: s.spareAmount,
        repairNeeded: s.repairNeeded || false,
        isScrap: s.isScrap || false,
        scrapOldSpareValue: s.scrapOldSpareValue || 0
      }))
    };

    await checkinAsset(payload);
    // // Optionally, persist new spares in main spare table
    // const newSpares = checkinSpares.filter((s) => s.isNew);
    // if (newSpares.length) {
    //   await addNewSparesToSpareTable(newSpares);
    // }
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

              // Row color based on approval status
              let rowStyle = {};
              if (asset.checkoutApprovalStatus === "Pending") rowStyle.backgroundColor = "#ffcccc"; // red
              else if (asset.checkoutApprovalStatus === "Approved") rowStyle.backgroundColor = "#fde39bff"; // green

              return (
                <TableRow key={asset.id} style={rowStyle}>
                  <TableCell>{asset.assetId}</TableCell>
                  <TableCell>{asset.name}</TableCell>
                  <TableCell>
                    {showCheckinButton && asset.checkoutApprovalStatus === "Approved" && (
                      <Button variant="contained" onClick={() => openCheckinDialog(asset)}>
                        Open Return Form
                      </Button>
                    )}
                    {showCheckoutButton && asset.checkoutApprovalStatus !== "Pending" && (
                      <Button variant="contained" onClick={() => openCheckoutDialog(asset)}>Checkout</Button>
                    )}
                    <Button variant="text" color="secondary" onClick={() => openReportDialog(asset)}>View</Button>
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

      {/* ✅ Checkin (Return) Dialog */}
      <Dialog open={openCheckin} onClose={() => setOpenCheckin(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Return / Checkin Asset</DialogTitle>
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
          <Typography mt={2} variant="subtitle1">Returned Spares</Typography>
          {checkinSpares.map((spare, index) => {
            const selectedSpare = spareOptionsData.find((s) => s.spareName === spare.spareName);
            const checkoutDate = selectedAsset?.checkOutDateTime
              ? new Date(selectedAsset.checkOutDateTime)
              : new Date(); // fallback today if missing

            const isUnderWarranty =
              selectedSpare?.warrantyExpiry &&
              new Date(selectedSpare.warrantyExpiry) >= checkoutDate;
            // disable fields if old spare is under warranty or repair-needed
            const disableFields = (spare.repairNeeded && !spare.isNew);

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
                    onChange={(e) =>
                      handleSpareChange(index, "warrantyExpiry", e.target.value, "checkin")
                    }
                    disabled={disableFields}
                  />
                )}

                {/* Amount */}
                <TextField
                  fullWidth
                  type="number"
                  label="Spare Amount"
                  margin="dense"
                  value={spare.spareAmount || 0}
                  onChange={(e) =>
                    handleSpareChange(index, "spareAmount", e.target.value, "checkin")
                  }
                  inputProps={{ min: 0 }}
                  disabled={disableFields}
                />

                {/* Repair Needed */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={spare.repairNeeded || false}
                      onChange={(e) =>
                        handleSpareChange(index, "repairNeeded", e.target.checked, "checkin")
                      }
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
                  onChange={(e) =>
                    handleSpareChange(index, "scrapOldSpareValue", e.target.value, "checkin")
                  }
                  inputProps={{ min: 0 }}
                  disabled={isUnderWarranty}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={spare.isScrap || false}
                      onChange={(e) =>
                        handleSpareChange(index, "isScrap", e.target.checked, "checkin")
                      }
                      disabled={isUnderWarranty}
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
          <Button variant="contained" onClick={handleCheckinSubmit}>
            Submit Return
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openReport}
        onClose={() => setOpenReport(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Asset Maintenance Report</DialogTitle>
        <DialogContent>
          {reportAsset ? (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Asset ID</TableCell>
                  <TableCell>Asset Name</TableCell>
                  <TableCell>Checked Out</TableCell>
                  <TableCell>Returned</TableCell>
                  <TableCell>Approval Status</TableCell>
                  <TableCell>Spare Name</TableCell>
                  <TableCell>Warranty Expiry</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Repair Needed</TableCell>
                  <TableCell>Is Scrap</TableCell>
                  <TableCell>Return Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((s, i) => (
                  <TableRow key={i}>
                    {/* Asset Columns */}
                    <TableCell>{reportAsset.assetId}</TableCell>
                    <TableCell>{reportAsset.name}</TableCell>
                    <TableCell>
                      {reportAsset.checkOutDateTime
                        ? new Date(reportAsset.checkOutDateTime).toLocaleString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {reportAsset.returnDate
                        ? new Date(reportAsset.returnDate).toLocaleString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>{reportAsset.checkoutApprovalStatus}</TableCell>

                    {/* Spare Columns */}
                    <TableCell>{reportAsset ? reportAsset.spareName : "-"}</TableCell>
                    <TableCell>
                      {s && s.warrantyExpiry
                        ? new Date(s.warrantyExpiry).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>{s ? s.spareAmount : "-"}</TableCell>
                    <TableCell>{s ? (s.repairNeeded ? "Yes" : "No") : "-"}</TableCell>
                    <TableCell>{s ? (s.isScrap ? "Yes" : "No") : "-"}</TableCell>
                    <TableCell>
                      {s && s.tentativeReturnDate
                        ? new Date(s.tentativeReturnDate).toLocaleDateString()
                        : "-"}
                    </TableCell>

                    {/* Action Buttons only on first row */}
                    <TableCell>
                      {/* Checkout approval actions */}
                      {i === 0 && reportAsset.checkoutApprovalStatus === "Pending" && (
                        <>
                          <IconButton
                            color="success"
                            onClick={async () => {
                              try {
                                await approveAssetCheckout(
                                  reportAsset.checkoutId,
                                  reportAsset.checkoutApprovedBy
                                );
                                fetchAssets(officeId);
                                setOpenReport(false);
                              } catch (err) {
                                console.error("Checkout Approval failed:", err);
                                alert("Checkout approval failed. Please try again.");
                              }
                            }}
                          >
                            <CheckCircle />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={async () => {
                              try {
                                await rejectAssetCheckout(reportAsset.checkoutId);
                                fetchAssets(officeId);
                                setOpenReport(false);
                              } catch (err) {
                                console.error("Checkout Rejection failed:", err);
                                alert("Checkout rejection failed. Please try again.");
                              }
                            }}
                          >
                            <Cancel />
                          </IconButton>
                        </>
                      )}

                      {/* ✅ Check-in approval actions */}
                      {i === 0 && reportAsset.returnApprovalStatus === "Pending" && (
                        <>
                          {console.log("Report Asset:", reportAsset)}
                          <IconButton
                            color="success"
                            onClick={async () => {
                              try {
                                await approveAssetCheckin(
                                  reportAsset.checkoutId,
                                  reportAsset.returnApprovedBy,
                                  { spareFields: reportAsset.spareFields || [] } // pass spares if any
                                );
                                fetchAssets(officeId);
                                setOpenReport(false);
                              } catch (err) {
                                console.error("Check-in Approval failed:", err);
                                alert("Check-in approval failed. Please try again.");
                              }
                            }}
                          >
                            <CheckCircle />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={async () => {
                              try {
                                await rejectAssetCheckin(reportAsset.checkoutId);
                                fetchAssets(officeId);
                                setOpenReport(false);
                              } catch (err) {
                                console.error("Check-in Rejection failed:", err);
                                alert("Check-in rejection failed. Please try again.");
                              }
                            }}
                          >
                            <Cancel />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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