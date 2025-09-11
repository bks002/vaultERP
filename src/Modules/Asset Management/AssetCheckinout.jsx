import React, { useState, useEffect } from "react";
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, IconButton, Select, MenuItem, FormControl, InputLabel, Checkbox,
  FormControlLabel
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { useSelector } from "react-redux";
import ReplacementDialog from "../../Components/replacementspare";

export default function AssetMaintenance() {
  const officeId = useSelector(state => state.user.officeId);
  const [assets, setAssets] = useState([]);
  const [isReplacement, setIsReplacement] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [approverId, setApproverId] = useState(""); // <-- Add this
  const [outFromOptions, setOutFromOptions] = useState([]);
  const [spares, setSpares] = useState([]);
  const [openCheckout, setOpenCheckout] = useState(false);
  const [openCheckin, setOpenCheckin] = useState(false);
  const [assigneeId, setAssigneeId] = useState("");
  const [assigneeName, setAssigneeName] = useState("");
  const [checkoutDateTime, setCheckoutDateTime] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [checkinDateTime, setCheckinDateTime] = useState(new Date().toISOString().slice(0, 16));
  const [returnCondition, setReturnCondition] = useState("");
  const [purpose, setPurpose] = useState("");
  const [outFrom, setOutFrom] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [availableSpares, setAvailableSpares] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assetStatus, setAssetStatus] = useState({});
  const [replacementDialogOpen, setReplacementDialogOpen] = useState(false);
  const [replacementData, setReplacementData] = useState(null);
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [reportData, setReportData] = useState([]);

  useEffect(() => {
    fetchAssets();
    fetchOutFromOptions();
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`https://admin.urest.in:8089/api/Employee?officeId=${officeId}`);
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error("Failed to fetch employees", err);
    }
  };

  const handleViewReport = async (assetId) => {
    try {
      const res = await fetch(
        `https://admin.urest.in:8089/api/asset/AssetSpareOps/report?assetId=${assetId}`
      );
      if (!res.ok) throw new Error("Failed to fetch report");
      const data = await res.json();
      setReportData(data);
      setOpenReportDialog(true);
    } catch (err) {
      console.error("Error fetching report:", err);
      alert("Failed to fetch report");
    }
  };

  const fetchAssets = async () => {
    try {
      const res = await fetch(`https://admin.urest.in:8089/api/asset/AssetSpareOps/all-assets/${officeId}`);
      const data = await res.json();
      setAssets(data);

      // create a map of assetId -> status
      const statusMap = {};
      data.forEach(a => {
        statusMap[a.id] = {
          assetStatus: a.maintenanceStatus || "N/A",
          approvalStatus: a.approvalStatus || "Pending", // default to Pending if missing
          lastCheckout: {
            outFrom: a.outFrom || "",
            sentTo: a.sentTo || ""
          }
        };
      });
      setAssetStatus(statusMap);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSpares = async (assetId) => {
    try {
      const res = await fetch(`https://admin.urest.in:8089/api/asset/AssetSpare/asset/${assetId}`);
      const data = await res.json();
      setAvailableSpares(data);
    } catch (err) {
      console.error("Failed to fetch spares for asset", err);
    }
  };

  const fetchOutFromOptions = async () => {
    try {
      const res = await fetch("https://admin.urest.in:8089/api/Office");
      const data = await res.json();
      setOutFromOptions(data);
    } catch (err) {
      console.error("Failed to fetch Out From options", err);
    }
  };

  const handleAddSpareRow = () => {
    setSpares([...spares, {
      spareName: "",
      spareAmount: 1,
      tentativeReturnDate: "",
      remarks: "",
      imageFile: null
    }]);
  };

  const handleRemoveSpareRow = (index) => {
    const updated = [...spares];
    updated.splice(index, 1);
    setSpares(updated);
  };


  const handleImageUpload = (index, file) => {
    handleSpareChange(index, "imageFile", file);
  };

  // helper: convert file -> base64
  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]); // strip "data:image/png;base64,"
    reader.onerror = (err) => reject(err);
  });

  const handleApproval = async (assetId, status = "Approved", comments = "Approved") => {
    try {
      const approvedBy = 1; // Replace with dynamic user ID if needed
      const url = `https://admin.urest.in:8089/api/asset/AssetSpareOps/approve?maintenanceId=${assetId}&status=${status}&approvedBy=${approvedBy}&comments=${encodeURIComponent(comments)}`;

      const res = await fetch(url, { method: "PUT" });

      if (res.ok) {
        alert(`Asset ${status.toLowerCase()} successfully!`);
        fetchAssets(); // refresh asset list
      } else {
        const errData = await res.json();
        console.error(errData);
        alert("Approval failed!");
      }
    } catch (err) {
      console.error(err);
      alert("Approval failed!");
    }
  };

  // ===================== CHECKOUT =====================
  const handleCheckoutSubmit = async () => {
    if (!selectedAsset) return;

    try {
      for (const spare of spares) {
        const formData = new FormData();
        formData.append("SpareId", spare.spareId);
        formData.append("AssetId", selectedAsset.id);
        formData.append("IssuedTo", assigneeName || 0); // employeeId (int)
        formData.append("IssuedBy", "");
        formData.append("IssueDate", new Date(checkoutDateTime).toISOString());
        formData.append("ExpectedReturnDate", spare.tentativeReturnDate || null);
        formData.append("ActualReturnDate", new Date(checkoutDateTime).toISOString());

        // ✅ provide defaults
        formData.append("UnderWarranty", !!spare.warrantyExpiry);
        formData.append("WarrantyExpiry", spare.warrantyExpiry || new Date().toISOString());
        formData.append("ReplacementCost", 0);
        formData.append("ScrapValue", 0);
        formData.append("NetCost", 0);

        // ✅ must not be empty
        formData.append("ReturnCondition", returnCondition || "Good");

        formData.append("Quantity", spare.spareAmount || 1);
        formData.append("Status", "CheckedOut");
        formData.append("Purpose", purpose || "NA");
        formData.append("OutFrom", outFrom || "NA");
        formData.append("SentTo", sentTo || "NA");
        formData.append("Remarks", spare.remarks || "NA");
        formData.append("CreatedAt", new Date().toISOString());
        formData.append("UpdatedAt", new Date().toISOString());

        // ✅ Convert image to base64 if present
        if (spare.imageFile) {
          const base64 = await toBase64(spare.imageFile);
          formData.append("ImageOut", base64);
        }

        await fetch(
          `https://admin.urest.in:8089/api/asset/AssetSpareOps/log-action?actionType=checkout`,
          { method: "POST", body: formData }
        );
      }

      setOpenCheckout(false);
      setSpares([]);
      fetchAssets();
      setAssetStatus(prev => ({
        ...prev,
        [selectedAsset.id]: {
          ...(prev[selectedAsset.id] || {}),
          assetStatus: "CheckedOut",
          lastCheckout: { outFrom, sentTo }
        }
      }));
    } catch (err) {
      console.error(err);
      alert("Checkout failed");
    }
  };

  const handleSpareChange = (index, field, value) => {
    const updated = [...spares];
    updated[index][field] = value;
    setSpares(updated);
  };

  const handleCheckinSubmit = async () => {
    if (!selectedAsset) return;

    try {
      // Prepare the payload for each spare
      for (const spare of spares) {
        const isReplacement = purpose === "Replacement" && spare.replacementRequired;

        const formData = new FormData();

        // maintenance object → stringify
        formData.append("Maintenance", JSON.stringify({
          id: 0,
          spareId: spare.spareId || 0,
          assetId: selectedAsset.id,
          issuedTo: assigneeId || 0,
          issuedBy: approverId || 0, // or logged-in user id if available
          issueDate: new Date().toISOString(),
          expectedReturnDate: spare.tentativeReturnDate
            ? new Date(spare.tentativeReturnDate).toISOString()
            : new Date().toISOString(),
          actualReturnDate: new Date(checkinDateTime).toISOString(),
          underWarranty: !!spare.warrantyExpiry,
          warrantyExpiry: spare.warrantyExpiry || new Date().toISOString(),
          replacementCost: spare.replacementCost || 0,
          scrapValue: spare.scrapValue || 0,
          netCost: spare.netCost || 0,
          returnCondition: returnCondition || "Good",
          quantity: spare.spareAmount || 1,
          status: "CheckedIn",
          purpose: purpose || "",
          outFrom: outFrom || "",
          sentTo: sentTo || "",
          imageOut: spare.imageOut || "",
          remarks: spare.remarks || "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));

        // If you need to upload an image (binary file), append it separately
        if (spare.imageFile) {
          formData.append("imageIn", spare.imageFile);
        } else {
          formData.append("imageIn", ""); // optional
        }

        // ReplacementRequired flag
        formData.append("ReplacementRequired", isReplacement ? "true" : "false");
        // Replacement object → stringify only if required
        if (isReplacement && replacementData) {
          formData.append("Replacement", JSON.stringify(replacementData));
        }

        // ApproverId
        formData.append("ApproverId", approverId || 0);

        const res = await fetch(
          "https://admin.urest.in:8089/api/asset/AssetSpareOps/checkin-full",
          {
            method: "POST",
            body: formData, // do NOT set Content-Type, browser will set with boundary
          }
        );

        const data = await res.json();
        console.log(data);

        if (!res.ok) {
          const errData = await res.json();
          console.error(errData);
          alert("Checkin failed");
          return;
        }
      }

      // Reset UI
      setOpenCheckin(false);
      setSpares([]);
      fetchAssets();
      setAssetStatus((prev) => ({
        ...prev,
        [selectedAsset.id]: {
          ...(prev[selectedAsset.id] || {}),
          assetStatus: "CheckedIn",
          approvalStatus: "Pending",  // ✅ requires approval
          lastCheckout: { outFrom, sentTo }
        }
      }));
    } catch (err) {
      console.error(err);
      alert("Checkin failed");
    }
  };

  // When opening Checkin dialog
  const openCheckinDialog = (asset) => {
    setSelectedAsset(asset);
    fetchSpares(asset.id);
    console.log(assetStatus[asset.id]?.lastCheckout);
    // Use the lastCheckout info from assetStatus map
    setOutFrom(assetStatus[asset.id]?.lastCheckout?.sentTo || asset.sentTo || "");
    setSentTo(assetStatus[asset.id]?.lastCheckout?.outFrom || asset.outFrom || "");
    setOpenCheckin(true);
  };

  return (
    <Box p={1}>
      <h2>Asset Maintenance</h2>

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
            {assets.map(asset => (
              <TableRow key={asset.id}>
                <TableCell>{asset.id}</TableCell>
                <TableCell>{asset.assetName}</TableCell>
                <TableCell>
                  <Button
                    color="info"
                    sx={{ ml: 1 }}
                    onClick={() => handleViewReport(asset.id)}
                  >
                    View
                  </Button>
                  {(() => {
                    const status = assetStatus[asset.id]?.assetStatus;
                    const approval = assetStatus[asset.id]?.approvalStatus;

                    if (status === "N/A" && approval === "Pending") {
                      // Step 1
                      return (
                        <Button
                          color="primary"
                          onClick={() => {
                            setSelectedAsset(asset);
                            fetchSpares(asset.id);
                            setOpenCheckout(true);
                          }}
                        >
                          Checkout
                        </Button>
                      );
                    }

                    if (status === "CheckedOut" && approval === "Pending") {
                      // Step 2
                      return (
                        <>
                          <Button
                            color="success"
                            onClick={() =>
                              handleApproval(asset.maintenanceId, "Approved", "approved")
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            color="error"
                            sx={{ ml: 1 }}
                            onClick={() =>
                              handleApproval(asset.maintenanceId, "Rejected", "Not approved")
                            }
                          >
                            Reject
                          </Button>
                        </>
                      );
                    }

                    if (status === "Approved" && approval === "Approved") {
                      // Step 3
                      return (
                        <Button
                          color="secondary"
                          onClick={() => openCheckinDialog(asset)}
                        >
                          Checkin
                        </Button>
                      );
                    }

                    if (status === "CheckedIn" && approval === "Pending") {
                      // Step 2
                      return (
                        <>
                          <Button
                            color="success"
                            onClick={() =>
                              handleApproval(asset.maintenanceId, "Approved", "approved")
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            color="error"
                            sx={{ ml: 1 }}
                            onClick={() =>
                              handleApproval(asset.maintenanceId, "Rejected", "Not approved")
                            }
                          >
                            Reject
                          </Button>
                        </>
                      );
                    }

                    if (status === "CheckedIn") {
                      // Step 4 (reset state, show Checkout again)
                      return (
                        <Button
                          color="primary"
                          onClick={() => {
                            setSelectedAsset(asset);
                            fetchSpares(asset.id);
                            setOpenCheckout(true);
                          }}
                        >
                          Checkout
                        </Button>
                      );
                    }

                    return null;
                  })()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Checkout Dialog */}
      <Dialog open={openCheckout} onClose={() => setOpenCheckout(false)} maxWidth="md" fullWidth>
        <DialogTitle>Checkout Asset: {selectedAsset?.assetName}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel id="assignee-label">Assignee</InputLabel>
            <Select
              labelId="assignee-label"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
            >
              {employees.map((emp) => (
                <MenuItem key={emp.employeeId} value={emp.employeeId}>
                  {emp.employeeName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            type="datetime-local"
            label="Checkout Date"
            fullWidth
            value={checkoutDateTime}
            onChange={e => setCheckoutDateTime(e.target.value)}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="purpose-label">Purpose</InputLabel>
            <Select
              labelId="purpose-label"
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
            >
              <MenuItem value="Repair">Repair</MenuItem>
              <MenuItem value="Replacement">Replacement</MenuItem>
              <MenuItem value="Loan">Loan</MenuItem>
              <MenuItem value="Testing">Testing</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel id="outfrom-label">Out From</InputLabel>
            <Select
              labelId="outfrom-label"
              value={outFrom}
              onChange={e => setOutFrom(e.target.value)}
            >
              {outFromOptions.map((opt) => (
                <MenuItem key={opt.officeId} value={opt.officeName}>
                  {opt.officeName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Sent To" fullWidth value={sentTo} onChange={e => setSentTo(e.target.value)} margin="normal" />

          <Box mt={2}>
            <Button startIcon={<Add />} onClick={handleAddSpareRow}>Add Spare</Button>

            {spares.map((spare, idx) => (
              <Table key={idx} size="small" sx={{ mt: 2, border: "1px solid #ddd" }}>
                <TableBody>
                  <TableRow>
                    <TableCell><b>Spare Name</b></TableCell>
                    <TableCell>
                      <FormControl fullWidth>
                        <Select
                          value={spare.spareId || ""}
                          onChange={(e) => {
                            const selected = availableSpares.find(s => s.spareId === e.target.value);
                            handleSpareChange(idx, "spareId", selected.spareId);
                            handleSpareChange(idx, "spareName", selected.spareName);
                            handleSpareChange(idx, "warrantyExpiry", selected.warrantyExpiry); // ✅ save expiry
                            setSentTo(selected.vendorName || "");
                          }}
                        >
                          {availableSpares.map((s) => (
                            <MenuItem key={s.spareId} value={s.spareId}>
                              {s.spareName}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {spare.warrantyExpiry && (() => {
                        const expiryDate = new Date(spare.warrantyExpiry);
                        const today = new Date();
                        const diffTime = expiryDate - today;
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        return (
                          <p style={{ marginTop: "4px", fontSize: "0.9em", color: diffDays < 0 ? "red" : "gray" }}>
                            Warranty Expiry: {expiryDate.toLocaleDateString()}{" "}
                            {diffDays >= 0
                              ? `( ${diffDays} days left )`
                              : `( Expired ${Math.abs(diffDays)} days ago )`}
                          </p>
                        );
                      })()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><b>Quantity</b></TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={spare.spareAmount}
                        onChange={e => handleSpareChange(idx, "spareAmount", e.target.value)}
                        fullWidth
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><b>Tentative Return Date</b></TableCell>
                    <TableCell>
                      <TextField
                        type="date"
                        value={spare.tentativeReturnDate}
                        onChange={e => handleSpareChange(idx, "tentativeReturnDate", e.target.value)}
                        fullWidth
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><b>Remarks</b></TableCell>
                    <TableCell>
                      <TextField
                        value={spare.remarks}
                        onChange={e => handleSpareChange(idx, "remarks", e.target.value)}
                        fullWidth
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><b>Image</b></TableCell>
                    <TableCell>
                      <input type="file" onChange={e => handleImageUpload(idx, e.target.files[0])} />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><b>Action</b></TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleRemoveSpareRow(idx)}><Delete /></IconButton>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCheckout(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCheckoutSubmit}>Submit</Button>
        </DialogActions>
      </Dialog>

      {/* Checkin Dialog */}
      <Dialog open={openCheckin} onClose={() => setOpenCheckin(false)} maxWidth="md" fullWidth>
        <DialogTitle>Checkin Asset: {selectedAsset?.assetName}</DialogTitle>
        <DialogContent>
          <TextField
            type="datetime-local"
            label="Checkin Date"
            fullWidth
            value={checkinDateTime}
            onChange={e => setCheckinDateTime(e.target.value)}
            margin="normal"
          />
          <TextField
            label="Out From"
            fullWidth
            value={outFrom}
            disabled
            margin="normal"
          />

          <TextField
            label="Sent To"
            fullWidth
            value={sentTo}
            disabled
            margin="normal"
          />
          <TextField label="Return Condition" fullWidth value={returnCondition} onChange={e => setReturnCondition(e.target.value)} margin="normal" />
          <FormControl fullWidth margin="normal">
            <InputLabel id="purpose-checkin-label">Purpose</InputLabel>
            <Select
              labelId="purpose-checkin-label"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            >
              <MenuItem value="Maintenance">Maintenance</MenuItem>
              <MenuItem value="Replacement">Replacement</MenuItem>
            </Select>
          </FormControl>

          {/* Approver Dropdown */}
          <FormControl fullWidth margin="normal">
            <InputLabel id="approver-label">Approver</InputLabel>
            <Select
              labelId="approver-label"
              value={approverId || ""}
              onChange={(e) => setApproverId(e.target.value)}
            >
              {employees.map(emp => (
                <MenuItem key={emp.employeeId} value={emp.employeeId}>
                  {emp.employeeName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box mt={2}>
            <Button startIcon={<Add />} onClick={handleAddSpareRow}>
              Add Spare
            </Button>

            {spares.map((spare, idx) => (
              <Table key={idx} size="small" sx={{ mt: 2, border: "1px solid #ddd" }}>
                <TableBody>
                  <TableRow>
                    <TableCell><b>Spare Name</b></TableCell>
                    <TableCell>
                      <FormControl fullWidth>
                        <Select
                          value={spare.spareId || ""}
                          onChange={(e) => {
                            const selected = availableSpares.find(s => s.spareId === e.target.value);
                            handleSpareChange(idx, "spareId", selected.spareId);
                            handleSpareChange(idx, "spareName", selected.spareName);
                            handleSpareChange(idx, "warrantyExpiry", selected.warrantyExpiry);
                            setSentTo(selected.vendorName || "");
                          }}
                        >
                          {availableSpares.map((s) => (
                            <MenuItem key={s.spareId} value={s.spareId}>
                              {s.spareName}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {spare.warrantyExpiry && (() => {
                        const expiryDate = new Date(spare.warrantyExpiry);
                        const today = new Date();
                        const diffTime = expiryDate - today;
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        return (
                          <p style={{ marginTop: "4px", fontSize: "0.9em", color: diffDays < 0 ? "red" : "gray" }}>
                            Warranty Expiry: {expiryDate.toLocaleDateString()}{" "}
                            {diffDays >= 0
                              ? `( ${diffDays} days left )`
                              : `( Expired ${Math.abs(diffDays)} days ago )`}
                          </p>
                        );
                      })()}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell><b>Quantity</b></TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={spare.spareAmount || 1}
                        onChange={(e) => handleSpareChange(idx, "spareAmount", Number(e.target.value))}
                        fullWidth
                      />
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell><b>Remarks</b></TableCell>
                    <TableCell>
                      <TextField
                        value={spare.remarks || ""}
                        onChange={(e) => handleSpareChange(idx, "remarks", e.target.value)}
                        fullWidth
                      />
                    </TableCell>
                  </TableRow>

                  {/* Replacement Logic */}
                  <TableRow>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={spare.replacementRequired || false}
                          onChange={(e) => {
                            handleSpareChange(idx, "replacementRequired", e.target.checked);
                            if (e.target.checked) setReplacementDialogOpen(true);
                          }}
                        />
                      }
                      label="Replacement Required"
                    />
                  </TableRow>

                  {/* {spare.replacementRequired && (
                    <>
                      <TableRow>
                        <TableCell><b>Scrap Value</b></TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={spare.scrapValue || ""}
                            onChange={(e) => {
                              const updated = [...spares];
                              updated[idx].scrapValue = Number(e.target.value) || 0;
                              updated[idx].netCost =
                                (updated[idx].replacementCost || 0) - updated[idx].scrapValue;
                              setSpares(updated);
                            }}
                            fullWidth
                          />
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell><b>Replacement Cost</b></TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={spare.replacementCost || ""}
                            onChange={(e) => {
                              const updated = [...spares];
                              updated[idx].replacementCost = Number(e.target.value) || 0;
                              updated[idx].netCost =
                                updated[idx].replacementCost - (updated[idx].scrapValue || 0);
                              setSpares(updated);
                            }}
                            fullWidth
                          />
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell><b>Net Cost</b></TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={spare.netCost || 0}
                            disabled
                            fullWidth
                          />
                        </TableCell>
                      </TableRow>
                    </>
                  )} */}
                  <ReplacementDialog
                    open={replacementDialogOpen}
                    onClose={() => setReplacementDialogOpen(false)}
                    onSave={(data) => setReplacementData(data)}
                    asset={selectedAsset}
                  />

                  <TableRow>
                    <TableCell><b>Image</b></TableCell>
                    <TableCell>
                      <input type="file" onChange={e => handleImageUpload(idx, e.target.files[0])} />
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell><b>Action</b></TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleRemoveSpareRow(idx)}><Delete /></IconButton>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCheckin(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCheckinSubmit}>Submit</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openReportDialog}
        onClose={() => setOpenReportDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Asset Report</DialogTitle>
        <DialogContent>
          {reportData.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Spare ID</TableCell>
                    <TableCell>Issued To</TableCell>
                    <TableCell>Issued By</TableCell>
                    <TableCell>Issue Date</TableCell>
                    <TableCell>Return Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.spareId}</TableCell>
                      <TableCell>{row.issuedTo?.employeeName || "-"}</TableCell>
                      <TableCell>{row.issuedBy?.employeeName || "-"}</TableCell>
                      <TableCell>
                        {row.issueDate ? new Date(row.issueDate).toLocaleString() : "-"}
                      </TableCell>
                      <TableCell>
                        {row.actualReturnDate
                          ? new Date(row.actualReturnDate).toLocaleString()
                          : "-"}
                      </TableCell>
                      <TableCell>{row.status || "-"}</TableCell>
                      <TableCell>{row.remarks || " "}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <p>No report data available.</p>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReportDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
