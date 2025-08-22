"use client";
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Stack,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useSelector } from "react-redux";

import {
  getJobCards,
  createJobCard,
  updateJobCard,
  deleteJobCard,
} from "../../Services/JobCard";
import { getAllShift } from "../../Services/ShiftService";
import { getInternalWorkOrdersByOffice } from "../../Services/InternalWorkOrderService";
import { getAllAssets } from "../../Services/AssetService";
import { getAllItems } from "../../Services/InventoryService";
import { getAllOperation } from "../../Services/OperationService";
import { getContructionByitemoperationinwo } from "../../Services/ConstructionDesignSheet";

const JobCardMaster = () => {
  const officeId = useSelector((state) => state.user.officeId);

  const [jobCards, setJobCards] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [assets, setAssets] = useState([]);
  const [internalWos, setInternalWos] = useState([]);
  const [compounds, setCompounds] = useState([]);
  const [operations, setOperations] = useState([]);
  const [constructionData, setConstructionData] = useState([]); // ✅ store construction data

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editId, setEditId] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewData, setViewData] = useState({});

  const handleView = async (jobCard) => {
    // Map API data to viewData
    const updatedData = {
      ...jobCard,
      internalWoId: jobCard.internalWo,
      shiftId: jobCard.shiftId,
      assetId: jobCard.assetId,
      compoundId: jobCard.itemId, // Map itemId to compoundId
      operationId: jobCard.operationId,
      date: jobCard.date?.substring(0, 10) || "",
      isCode: jobCard.isCode,
      compacted: jobCard.compected === 1 ? "Yes" : "No",
      diaOfAMWire: jobCard.noDiaOfAmWire,
      payOffDNo: jobCard.payOffDNo,
      takeUpDrumSize: jobCard.takeUpDrumSize,
      embossing: jobCard.embrossing,
      remark: jobCard.remark,
    };

    setViewData(updatedData);

    // Fetch construction data dynamically
    if (updatedData.internalWoId && updatedData.compoundId && updatedData.operationId) {
      try {
        const data = await getContructionByitemoperationinwo(
          updatedData.internalWoId,
          updatedData.compoundId,
          updatedData.operationId
        );
        setConstructionData(data);
      } catch (err) {
        console.error("Failed to fetch construction data for view:", err);
        setConstructionData([]);
      }
    } else {
      setConstructionData([]);
    }

    setViewOpen(true);
  };

  const handleViewClose = () => {
    setViewOpen(false);
    setViewData({});
    setConstructionData([]);
  };


  useEffect(() => {
    if (officeId) loadData();
  }, [officeId]);

  const loadData = async () => {
    try {
      const [shiftData, assetData, inwoData, compoundData, operationData] =
        await Promise.all([
          getAllShift(officeId),
          getAllAssets(officeId),
          getInternalWorkOrdersByOffice(officeId),
          getAllItems(officeId),
          getAllOperation(officeId),
        ]);
      setShifts(shiftData);
      setAssets(assetData);
      setInternalWos(inwoData);
      setCompounds(compoundData);
      setOperations(operationData);

      const jcData = await getJobCards(officeId);
      setJobCards(jcData);
    } catch (err) {
      console.error("Failed to load data:", err);
    }
  };

  const handleOpen = async (jobCard = null) => {
    if (jobCard) {
      const mappedData = {
        ...jobCard,
        internalWoId: jobCard.internalWo,
        shiftId: jobCard.shiftId,
        assetId: jobCard.assetId,
        compoundId: jobCard.itemId, // important
        operationId: jobCard.operationId,
        date: jobCard.date?.substring(0, 10) || "",
        isCode: jobCard.isCode || "",
        compacted: jobCard.compected === 1 ? "Yes" : "No",
        diaOfAMWire: jobCard.noDiaOfAmWire || "",
        payOffDNo: jobCard.payOffDNo || "",
        takeUpDrumSize: jobCard.takeUpDrumSize || "",
        embossing: jobCard.embrossing || "",
        remark: jobCard.remark || "",
      };

      setFormData(mappedData);
      setEditId(jobCard.id);

      // ✅ Fetch construction data immediately
      if (mappedData.internalWoId && mappedData.compoundId && mappedData.operationId) {
        try {
          const data = await getContructionByitemoperationinwo(
            mappedData.internalWoId,
            mappedData.compoundId,
            mappedData.operationId
          );
          setConstructionData(data);
        } catch (err) {
          console.error("Failed to fetch construction data for edit:", err);
          setConstructionData([]);
        }
      } else {
        setConstructionData([]);
      }
    } else {
      setFormData({});
      setEditId(null);
      setConstructionData([]);
    }

    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({});
    setEditId(null);
    setConstructionData([]);
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...formData, [name]: value };
    setFormData(updatedForm);

    // ✅ Check if all required fields are selected, then call API
    if (
      updatedForm.internalWoId &&
      updatedForm.compoundId &&
      updatedForm.operationId
    ) {
      try {
        const data = await getContructionByitemoperationinwo(
          updatedForm.internalWoId,
          updatedForm.compoundId,
          updatedForm.operationId
        );
        setConstructionData(data);
      } catch (err) {
        console.error("Failed to fetch construction data:", err);
        setConstructionData([]);
      }
    } else {
      setConstructionData([]);
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        id: formData.id || 0,
        internalWo: formData.internalWoId || 0,
        isCode: formData.isCode || "",
        date: formData.date || new Date().toISOString(),
        shiftId: formData.shiftId || 0,
        assetId: formData.assetId || 0,
        itemId: formData.compoundId || 0,
        compected: formData.compacted === "Yes" ? 1 : 0,
        noDiaOfAmWire: formData.diaOfAMWire || "",
        payOffDNo: formData.payOffDNo || "",
        takeUpDrumSize: formData.takeUpDrumSize || "",
        embrossing: formData.embossing || "",
        remark: formData.remark || "",
        isActive: true,
        officeId: officeId || 0,
        createdBy: formData.createdBy || 0,
        createdOn: formData.createdOn || new Date().toISOString(),
        updatedBy: formData.updatedBy || 0,
        updatedOn: formData.updatedOn || new Date().toISOString(),
        operationId: formData.operationId || 0,
      };

      if (editId) {
        await updateJobCard(editId, payload);
      } else {
        await createJobCard(payload);
      }

      await loadData();
      handleClose();
    } catch (err) {
      console.error("Failed to save:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this Job Card?")) {
      try {
        await deleteJobCard(id);
        await loadData();
      } catch (err) {
        console.error("Failed to delete:", err);
      }
    }
  };

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4">Job Card Master</Typography>
        <Box display="flex" alignItems="center" gap={2}>
          {/* <TextField
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
          /> */}

          {/* <ExportCSVButton
            data={filteredAssets}
            filename="Assets.csv"
            headers={csvHeaders}
          /> */}

          <Button variant="contained" color="primary" onClick={() => handleOpen()}>
            Add Job Card
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Internal WO</TableCell>
              <TableCell>Shift</TableCell>
              <TableCell>Machine</TableCell>
              <TableCell>Compound</TableCell>
              <TableCell>Operation</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobCards.map((jc) => (
              <TableRow key={jc.id}>
                <TableCell>
                  {internalWos.find(
                    (i) => i.id === (jc.internalWoId || jc.internalWo)
                  )?.name ||
                    jc.internalWoId ||
                    jc.internalWo}
                </TableCell>
                <TableCell>
                  {shifts.find((s) => s.shiftId === jc.shiftId)?.shiftName ||
                    jc.shiftId}
                </TableCell>
                <TableCell>
                  {assets.find((a) => a.assetId === jc.assetId)?.assetName ||
                    jc.assetId}
                </TableCell>
                <TableCell>
                  {compounds.find(c => c.id === jc.itemId)?.name || jc.itemId}
                </TableCell>
                <TableCell>
                  {operations.find((o) => o.operationId === jc.operationId)
                    ?.operationName || jc.operationId}
                </TableCell>
                <TableCell>{jc.date?.substring(0, 10)}</TableCell>
                <TableCell align="center">
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleOpen(jc)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="View">
                    <IconButton color="info" onClick={() => handleView(jc)}>
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(jc.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {jobCards.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? "Edit Job Card" : "Add Job Card"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {/* Internal WO */}
            <TextField
              select
              fullWidth
              label="Internal WO"
              name="internalWoId"
              value={formData.internalWoId || ""}
              onChange={handleChange}
            >
              {internalWos.map((i) => (
                <MenuItem key={i.id} value={i.id}>
                  {i.id}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Is Code"
              name="isCode"
              value={formData.isCode || ""}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              type="date"
              label="Date"
              name="date"
              InputLabelProps={{ shrink: true }}
              value={formData.date || ""}
              onChange={handleChange}
            />

            {/* Operation */}
            <TextField
              select
              fullWidth
              label="Operation"
              name="operationId"
              value={formData.operationId || ""}
              onChange={handleChange}
            >
              {operations.map((o) => (
                <MenuItem key={o.operationId} value={o.operationId}>
                  {o.operationName}
                </MenuItem>
              ))}
            </TextField>

            {/* Compound */}
            <TextField
              select
              fullWidth
              label="Compound"
              name="compoundId"
              value={formData.compoundId || ""}
              onChange={handleChange}
            >
              {compounds.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>

            {/* ✅ Construction Data Table */}
            {constructionData.length > 0 && (
              <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Typography variant="subtitle1" sx={{ p: 1 }}>
                  Technical Specifications
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Specification</TableCell>
                      <TableCell>Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {constructionData.flatMap((row) =>
                      row.specifications.map((spec) => (
                        <TableRow key={spec.id}>
                          <TableCell>{spec.specification}</TableCell>
                          <TableCell>{spec.value}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Machine */}
            <TextField
              select
              fullWidth
              label="Machine"
              name="assetId"
              value={formData.assetId || ""}
              onChange={handleChange}
            >
              {assets.map((a) => (
                <MenuItem key={a.assetId} value={a.assetId}>
                  {a.assetName}
                </MenuItem>
              ))}
            </TextField>

            {/* Shift */}
            <TextField
              select
              fullWidth
              label="Shift"
              name="shiftId"
              value={formData.shiftId || ""}
              onChange={handleChange}
            >
              {shifts.map((s) => (
                <MenuItem key={s.shiftId} value={s.shiftId}>
                  {s.shiftName}
                </MenuItem>
              ))}
            </TextField>
            {/* Compacted */}
            <TextField
              select
              fullWidth
              label="Compacted"
              name="compacted"
              value={formData.compacted || ""}
              onChange={handleChange}
            >
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </TextField>

            {/* Dia of AM Wire/Strip */}
            <TextField
              fullWidth
              label="Dia of AM Wire/Strip"
              name="diaOfAMWire"
              value={formData.diaOfAMWire || ""}
              onChange={handleChange}
            />

            {/* Pay Off D.No */}
            <TextField
              fullWidth
              label="Pay Off D.No"
              name="payOffDNo"
              value={formData.payOffDNo || ""}
              onChange={handleChange}
            />

            {/* Take Up Drum Size */}
            <TextField
              fullWidth
              label="Take Up Drum Size"
              name="takeUpDrumSize"
              value={formData.takeUpDrumSize || ""}
              onChange={handleChange}
            />

            {/* Embossing */}
            <TextField
              fullWidth
              label="Embossing"
              name="embossing"
              value={formData.embossing || ""}
              onChange={handleChange}
            />

            {/* Remark */}
            <TextField
              fullWidth
              label="Remark"
              name="remark"
              value={formData.remark || ""}
              onChange={handleChange}
            />

          </Stack>
        </DialogContent>
        <DialogActions>
          <Stack direction="row" spacing={1}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit}>
              {editId ? "Update" : "Save"}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
      <Dialog open={viewOpen} onClose={handleViewClose} fullWidth maxWidth="sm">
        <DialogTitle>View Job Card</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {/* Internal WO */}
            <TextField
              select
              fullWidth
              label="Internal WO"
              name="internalWoId"
              value={viewData.internalWoId || ""}
              disabled
            >
              {internalWos.map((i) => (
                <MenuItem key={i.id} value={i.id}>
                  {i.id}
                </MenuItem>
              ))}
            </TextField>

            {/* Is Code */}
            <TextField fullWidth label="Is Code" name="isCode" value={viewData.isCode || ""} disabled />

            {/* Date */}
            <TextField
              fullWidth
              type="date"
              label="Date"
              name="date"
              InputLabelProps={{ shrink: true }}
              value={viewData.date || ""}
              disabled
            />

            {/* Operation */}
            <TextField select fullWidth label="Operation" name="operationId" value={viewData.operationId || ""} disabled>
              {operations.map((o) => (
                <MenuItem key={o.operationId} value={o.operationId}>
                  {o.operationName}
                </MenuItem>
              ))}
            </TextField>

            {/* Compound */}
            <TextField select fullWidth label="Compound" name="compoundId" value={viewData.compoundId || ""} disabled>
              {compounds.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>

            {/* Construction Data */}
            {constructionData.length > 0 && (
              <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Typography variant="subtitle1" sx={{ p: 1 }}>
                  Technical Specifications
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Specification</TableCell>
                      <TableCell>Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {constructionData.flatMap((row) =>
                      row.specifications.map((spec) => (
                        <TableRow key={spec.id}>
                          <TableCell>{spec.specification}</TableCell>
                          <TableCell>{spec.value}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Machine */}
            <TextField select fullWidth label="Machine" name="assetId" value={viewData.assetId || ""} disabled>
              {assets.map((a) => (
                <MenuItem key={a.assetId} value={a.assetId}>
                  {a.assetName}
                </MenuItem>
              ))}
            </TextField>

            {/* Shift */}
            <TextField select fullWidth label="Shift" name="shiftId" value={viewData.shiftId || ""} disabled>
              {shifts.map((s) => (
                <MenuItem key={s.shiftId} value={s.shiftId}>
                  {s.shiftName}
                </MenuItem>
              ))}
            </TextField>

            {/* Compacted */}
            <TextField select fullWidth label="Compacted" name="compacted" value={viewData.compacted || ""} disabled>
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </TextField>

            {/* Other fields */}
            <TextField fullWidth label="Dia of AM Wire/Strip" name="diaOfAMWire" value={viewData.diaOfAMWire || ""} disabled />
            <TextField fullWidth label="Pay Off D.No" name="payOffDNo" value={viewData.payOffDNo || ""} disabled />
            <TextField fullWidth label="Take Up Drum Size" name="takeUpDrumSize" value={viewData.takeUpDrumSize || ""} disabled />
            <TextField fullWidth label="Embossing" name="embossing" value={viewData.embossing || ""} disabled />
            <TextField fullWidth label="Remark" name="remark" value={viewData.remark || ""} disabled />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleViewClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default JobCardMaster;
