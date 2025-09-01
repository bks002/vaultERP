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
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useSelector } from "react-redux";
import {
  getJobCards,
  createJobCard,
  updateJobCard,
  deleteJobCard,
  getConstructionByGrade,
} from "../../Services/JobCard";
import { getAllShift } from "../../Services/ShiftService";
import { getInternalWorkOrdersByOffice } from "../../Services/InternalWorkOrderService";
import { getAllAssets } from "../../Services/AssetService";
import { getAllItems } from "../../Services/InventoryService";
import { getAllOperation } from "../../Services/OperationService";
import { getContructionByitemoperationinwo } from "../../Services/ConstructionDesignSheet";
import { getEmployeesByOperation } from "../../Services/OperationService";
import { getAllEmployees } from "../../Services/EmployeeService";
import { getItemById } from "../../Services/InventoryService";
import { getAssetsByOperation } from "../../Services/AssetOperation";

const JobCardMaster = () => {
  const officeId = useSelector((state) => state.user.officeId);
  const [jobCards, setJobCards] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [assets, setAssets] = useState([]);
  const [internalWos, setInternalWos] = useState([]);
  const [operations, setOperations] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [constructionData, setConstructionData] = useState([]);
  const [compoundName, setCompoundName] = useState("");
  const [filteredAssetsByOperation, setFilteredAssetsByOperation] = useState(
    []
  );
  const [gradeCodes, setGradeCodes] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editId, setEditId] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewData, setViewData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const getCurrentDateString = () => new Date().toISOString().substring(0, 10);

  const getGradeCodeNameByItemId = (itemId) => {
    const foundGrade = gradeCodes.find((g) => g.itemId === itemId);
    return foundGrade ? foundGrade.gradecode : "-";
  };

  useEffect(() => {
    if (officeId) loadData();
  }, [officeId]);

  const loadData = async () => {
    try {
      const [
        shiftData,
        assetData,
        inwoData,
        itemData,
        operationData,
        employeeData,
      ] = await Promise.all([
        getAllShift(officeId),
        getAllAssets(officeId),
        getInternalWorkOrdersByOffice(officeId),
        getAllItems(officeId),
        getAllOperation(officeId),
        getAllEmployees(officeId),
      ]);
      setShifts(shiftData);
      setAssets(assetData);
      setInternalWos(inwoData);
      setOperations(operationData);
      setAllEmployees(employeeData);
      const jobCardsData = await getJobCards(officeId);
      setJobCards(jobCardsData);

      // Fetch grade codes for all job cards
      const pairs = Array.from(
        new Set(jobCardsData.map((jc) => `${jc.internalWo}-${jc.operationId}`))
      );
      const allGradeCodes = [];
      for (const pair of pairs) {
        const [internalWo, operationId] = pair.split("-");
        if (internalWo && operationId) {
          const data = await getConstructionByGrade(
            parseInt(internalWo),
            parseInt(operationId)
          );
          if (data && data.length) {
            allGradeCodes.push(...data);
          }
        }
      }
      setGradeCodes(allGradeCodes);
    } catch (err) {
      console.error("Failed to load data:", err);
    }
  };

  useEffect(() => {
    const fetchGradeCodesForJobCards = async () => {
      if (!jobCards.length) return;
      try {
        const pairs = Array.from(
          new Set(jobCards.map((jc) => `${jc.internalWo}-${jc.operationId}`))
        );
        const allGradeCodes = [];
        for (const pair of pairs) {
          const [internalWo, operationId] = pair.split("-");
          if (internalWo && operationId) {
            const data = await getConstructionByGrade(
              parseInt(internalWo),
              parseInt(operationId)
            );
            if (data && data.length) {
              allGradeCodes.push(...data);
            }
          }
        }
        setGradeCodes(allGradeCodes);
      } catch (error) {
        console.error("Failed to preload grade codes for job cards:", error);
        setGradeCodes([]);
      }
    };

    fetchGradeCodesForJobCards();
  }, [jobCards]);

  const fetchEmployeesForOperation = async (operationId) => {
    try {
      if (!operationId) {
        setFilteredEmployees([]);
        return;
      }
      const data = await getEmployeesByOperation(operationId);
      setFilteredEmployees(data);
    } catch (err) {
      console.error("Failed to fetch employees by operation:", err);
      setFilteredEmployees([]);
    }
  };

  const handleView = async (jobCard) => {
    setViewData({
      ...jobCard,
      internalWoId: jobCard.internalWo,
      compoundId: jobCard.itemId,
      date: jobCard.date?.substring(0, 10) || "",
      compacted: jobCard.compected === 1 ? "Yes" : "No",
      diaOfAMWire: jobCard.noDiaOfAmWire || "", // <-- correct mapping
      embossing: jobCard.embrossing || "", // <-- correct mapping (fix spelling)
    });
    await fetchEmployeesForOperation(jobCard.operationId);
    if (jobCard.internalWo && jobCard.itemId && jobCard.operationId) {
      try {
        const data = await getContructionByitemoperationinwo(
          jobCard.internalWo,
          jobCard.itemId,
          jobCard.operationId
        );
        setConstructionData(data);
      } catch {
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
    setFilteredEmployees([]);
    setConstructionData([]);
  };

  const handleOpen = async (jobCard = null) => {
    if (jobCard) {
      const mappedData = {
        ...jobCard,
        internalWoId: jobCard.internalWo,
        compoundId: jobCard.itemId,
        date: jobCard.date?.substring(0, 10) || "",
        compacted: jobCard.compected === 1 ? "Yes" : "No",
        diaOfAMWire: jobCard.noDiaOfAmWire || "", // <-- add this
        embossing: jobCard.embrossing || "", // <-- add this (fix spelling)
      };
      setFormData(mappedData);
      setEditId(jobCard.id);
      await fetchEmployeesForOperation(mappedData.operationId);
      if (
        mappedData.internalWoId &&
        mappedData.compoundId &&
        mappedData.operationId
      ) {
        try {
          const data = await getContructionByitemoperationinwo(
            mappedData.internalWoId,
            mappedData.compoundId,
            mappedData.operationId
          );
          setConstructionData(data);
        } catch {
          setConstructionData([]);
        }

        try {
          const gradeData = await getConstructionByGrade(
            mappedData.internalWoId,
            mappedData.operationId
          );
          setGradeCodes(gradeData || []);
          const gradeObj = gradeData.find(
            (item) => item.itemId === mappedData.compoundId
          );
          setSelectedGrade(gradeObj?.gradecode || "");
          if (gradeObj?.itemId) {
            const itemData = await getItemById(gradeObj.itemId);
            setCompoundName(itemData?.name || "");
          } else {
            setCompoundName("");
          }
        } catch {
          setGradeCodes([]);
          setSelectedGrade("");
          setCompoundName("");
        }
      }
    } else {
      setFormData({ date: getCurrentDateString() });
      setEditId(null);
      setFilteredEmployees([]);
      setConstructionData([]);
      setGradeCodes([]);
      setSelectedGrade("");
      setCompoundName("");
    }
    setOpen(true);
  };

  const handleClose = async () => {
    setOpen(false);
    setFormData({});
    setEditId(null);
    setFilteredEmployees([]);
    setConstructionData([]);
    setSelectedGrade("");
    setCompoundName("");
    // Reload grade codes for all job cards after closing dialog
    try {
      const pairs = Array.from(
        new Set(jobCards.map((jc) => `${jc.internalWo}-${jc.operationId}`))
      );
      const allGradeCodes = [];
      for (const pair of pairs) {
        const [internalWo, operationId] = pair.split("-");
        if (internalWo && operationId) {
          const data = await getConstructionByGrade(
            parseInt(internalWo),
            parseInt(operationId)
          );
          if (data && data.length) {
            allGradeCodes.push(...data);
          }
        }
      }
      setGradeCodes(allGradeCodes);
    } catch {
      setGradeCodes([]);
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...formData, [name]: value };
    setFormData(updatedForm);
    if (name === "operationId") {
      await fetchEmployeesForOperation(value);
      try {
        const assetsByOp = await getAssetsByOperation(value);
        setFilteredAssetsByOperation(assetsByOp);
      } catch {
        setFilteredAssetsByOperation([]);
      }
      setFormData((prev) => ({ ...prev, operatorId: "", assetId: "" }));
      setSelectedGrade("");
      setGradeCodes([]);
      setCompoundName("");
      setConstructionData([]);
    }
    if (name === "internalWoId" || name === "operationId") {
      setSelectedGrade("");
      setConstructionData([]);
      setGradeCodes([]);
      setCompoundName("");
      if (updatedForm.internalWoId && updatedForm.operationId) {
        try {
          const data = await getConstructionByGrade(
            updatedForm.internalWoId,
            updatedForm.operationId
          );
          setGradeCodes(data || []);
        } catch {
          setGradeCodes([]);
        }
      }
    }
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
      } catch {
        setConstructionData([]);
      }
    } else {
      setConstructionData([]);
    }
  };

  const handleGradeChange = async (e) => {
    const gradeCode = e.target.value;
    setSelectedGrade(gradeCode);
    const gradeObj = gradeCodes.find((item) => item.gradecode === gradeCode);
    setFormData((prev) => ({
      ...prev,
      gradeCode,
      compoundId: gradeObj?.itemId || "",
    }));
    if (gradeObj) {
      setConstructionData([gradeObj]);
      if (gradeObj.itemId) {
        try {
          const itemData = await getItemById(gradeObj.itemId);
          setCompoundName(itemData?.name || "");
        } catch {
          setCompoundName("");
        }
      } else {
        setCompoundName("");
      }
    } else {
      setConstructionData([]);
      setCompoundName("");
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
        operatorId: formData.operatorId || 0,
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

  // Filter job cards based on search term (across all visible columns)
  const filteredJobCards = jobCards.filter((jc) => {
    const internalWoName =
      internalWos.find((i) => i.id === (jc.internalWoId || jc.internalWo))
        ?.name ||
      jc.internalWoId ||
      jc.internalWo ||
      "";
    const shiftName =
      shifts.find((s) => s.shiftId === jc.shiftId)?.shiftName ||
      jc.shiftId ||
      "";
    const machineName =
      assets.find((a) => a.assetId === jc.assetId)?.assetName ||
      jc.assetId ||
      "";
    const gradeCode = getGradeCodeNameByItemId(jc.itemId) || "";
    const operationName =
      operations.find((o) => o.operationId === jc.operationId)?.operationName ||
      jc.operationId ||
      "";
    const operatorName =
      allEmployees.find((e) => e.employeeId === jc.operatorId)?.employeeName ||
      jc.operatorId ||
      "";
    const date = jc.date?.substring(0, 10) || "";

    const search = searchTerm.toLowerCase();

    return (
      (internalWoName + "").toLowerCase().includes(search) ||
      (shiftName + "").toLowerCase().includes(search) ||
      (machineName + "").toLowerCase().includes(search) ||
      (gradeCode + "").toLowerCase().includes(search) ||
      (operationName + "").toLowerCase().includes(search) ||
      (operatorName + "").toLowerCase().includes(search) ||
      (date + "").toLowerCase().includes(search) ||
      (jc.isCode + "").toLowerCase().includes(search)
    );
  });

  return (
    <Container>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h4">Job Card Master</Typography>
        <Box display="flex" alignItems="center" gap={2}>
          {/* Search Bar */}
          <TextField
            size="small"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 220 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpen()}
          >
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
              <TableCell>Grade Code</TableCell>
              <TableCell>Operation</TableCell>
              <TableCell>Operator Name</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredJobCards.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No records found
                </TableCell>
              </TableRow>
            )}
            {filteredJobCards.map((jc) => (
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
                <TableCell>{getGradeCodeNameByItemId(jc.itemId)}</TableCell>
                <TableCell>
                  {operations.find((o) => o.operationId === jc.operationId)
                    ?.operationName || jc.operationId}
                </TableCell>
                <TableCell>
                  {allEmployees.find((e) => e.employeeId === jc.operatorId)
                    ?.employeeName || jc.operatorId}
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
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? "Edit Job Card" : "Add Job Card"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
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
            <TextField
              select
              fullWidth
              label="Operator Name"
              name="operatorId"
              value={formData.operatorId || ""}
              onChange={handleChange}
            >
              {(filteredEmployees.length > 0 ? filteredEmployees : []).map(
                (e) => (
                  <MenuItem key={e.employeeId} value={e.employeeId}>
                    {e.employeeName}
                  </MenuItem>
                )
              )}
            </TextField>
            <TextField
              select
              fullWidth
              label="Grade Code"
              name="gradeCode"
              value={selectedGrade}
              onChange={handleGradeChange}
            >
              {gradeCodes.map((g) => (
                <MenuItem key={g.gradecode} value={g.gradecode}>
                  {g.gradecode}
                </MenuItem>
              ))}
            </TextField>
            {selectedGrade && constructionData.length > 0 && (
              <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Typography variant="subtitle1" sx={{ p: 1 }}>
                  Compound {compoundName && ` - ${compoundName}`}
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Specification</TableCell>
                      <TableCell>Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {constructionData
                      .find((item) => item.gradecode === selectedGrade)
                      ?.specifications.map((spec) => (
                        <TableRow key={spec.id}>
                          <TableCell>{spec.specification}</TableCell>
                          <TableCell>{spec.value}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            <TextField
              select
              fullWidth
              label="Machine"
              name="assetId"
              value={formData.assetId || ""}
              onChange={handleChange}
            >
              {(filteredAssetsByOperation.length > 0
                ? filteredAssetsByOperation
                : assets
              ).map((a) => (
                <MenuItem key={a.assetId} value={a.assetId}>
                  {a.assetName}
                </MenuItem>
              ))}
            </TextField>
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
            <TextField
              fullWidth
              label="Dia of AM Wire/Strip"
              name="diaOfAMWire"
              value={formData.diaOfAMWire || ""}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              label="Pay Off D.No"
              name="payOffDNo"
              value={formData.payOffDNo || ""}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              label="Take Up Drum Size"
              name="takeUpDrumSize"
              value={formData.takeUpDrumSize || ""}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              label="Embossing"
              name="embossing"
              value={formData.embossing || ""}
              onChange={handleChange}
            />
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

      {/* View Dialog */}
      <Dialog open={viewOpen} onClose={handleViewClose} fullWidth maxWidth="sm">
        <DialogTitle>View Job Card</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
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
            <TextField
              fullWidth
              label="Is Code"
              name="isCode"
              value={viewData.isCode || ""}
              disabled
            />
            <TextField
              fullWidth
              type="date"
              label="Date"
              name="date"
              InputLabelProps={{ shrink: true }}
              value={viewData.date || ""}
              disabled
            />
            <TextField
              select
              fullWidth
              label="Operation"
              name="operationId"
              value={viewData.operationId || ""}
              disabled
            >
              {operations.map((o) => (
                <MenuItem key={o.operationId} value={o.operationId}>
                  {o.operationName}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              label="Operator Name"
              name="operatorId"
              value={viewData.operatorId || ""}
              disabled
            >
              {(filteredEmployees.length > 0 ? filteredEmployees : []).map(
                (e) => (
                  <MenuItem key={e.employeeId} value={e.employeeId}>
                    {e.employeeName}
                  </MenuItem>
                )
              )}
            </TextField>
            <TextField
              fullWidth
              label="Grade Code"
              value={getGradeCodeNameByItemId(viewData.compoundId)}
              disabled
            />
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
            <TextField
              select
              fullWidth
              label="Machine"
              name="assetId"
              value={viewData.assetId || ""}
              disabled
            >
              {assets.map((a) => (
                <MenuItem key={a.assetId} value={a.assetId}>
                  {a.assetName}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              label="Shift"
              name="shiftId"
              value={viewData.shiftId || ""}
              disabled
            >
              {shifts.map((s) => (
                <MenuItem key={s.shiftId} value={s.shiftId}>
                  {s.shiftName}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              label="Compacted"
              name="compacted"
              value={viewData.compacted || ""}
              disabled
            >
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Dia of AM Wire/Strip"
              name="diaOfAMWire"
              value={viewData.diaOfAMWire || ""}
              disabled
            />
            <TextField
              fullWidth
              label="Pay Off D.No"
              name="payOffDNo"
              value={viewData.payOffDNo || ""}
              disabled
            />
            <TextField
              fullWidth
              label="Take Up Drum Size"
              name="takeUpDrumSize"
              value={viewData.takeUpDrumSize || ""}
              disabled
            />
            <TextField
              fullWidth
              label="Embossing"
              name="embossing"
              value={viewData.embossing || ""}
              disabled
            />
            <TextField
              fullWidth
              label="Remark"
              name="remark"
              value={viewData.remark || ""}
              disabled
            />
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
