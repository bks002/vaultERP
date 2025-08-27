import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  IconButton,
  Tooltip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Grid,
  InputAdornment,
} from "@mui/material";
import { useSelector } from "react-redux";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ExportCSVButton from "../../Components/Export to CSV/ExportCSVButton.jsx";
import AlertSnackbar from "../../Components/Alert/AlertSnackBar.jsx";

import axios from "axios";

// Services imports
import { getAssetOperation } from "../../Services/AssetOperation.js";
import { getAllEmployees } from "../../Services/EmployeeService.js";
import { getAllOperation } from "../../Services/OperationService.js";
import { getAllAssets } from "../../Services/AssetService.js";
import { getAllShift } from "../../Services/ShiftService.js";
import {
  createPlanning,
  deletePlanning,
  getAllPlanningByOffice,
  updatePlanning,
} from "../../Services/PlanningService.js";
import { getInternalWorkOrdersByOffice } from "../../Services/InternalWorkOrderService.js";
import { getEmployeesByOperation } from "../../Services/OperationService.js";

const DailyPlanningSheet = () => {
  const officeId = useSelector((state) => state.user.officeId);
  const userId = useSelector((state) => state.user.userId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewShift, setViewShift] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [Employees, setEmployees] = useState([]); // All employees (can keep, but will filter below)
  const [Operations, setOperations] = useState([]);
  const [Assets, setAssets] = useState([]);
  const [planningData, setPlanningData] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [internalWorkOrders, setInternalWorkOrders] = useState([]);

  const [alert, setAlert] = useState({
    open: false,
    type: "success",
    message: "",
  });

  const emptyShift = {
    officeId: officeId || 0,
    id: 0,
    internalWorkOrderId: 0,
    planDate: "",
    operationId: 0,
    employeeId: 0,
    assetId: 0,
    shiftId: 0,
    manpower: "",
    target: "",
    achieved: 0,
    backfeed: "",
    remarks: "",
    isActive: true,
    createdBy: userId || 0,
  };

  const [selectedShift, setSelectedShift] = useState(emptyShift);

  // New states for filtered operations and filtered employees by operation
  const [filteredOperations, setFilteredOperations] = useState([]);
  const [loadingOperations, setLoadingOperations] = useState(false);

  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  useEffect(() => {
    if (officeId) {
      loadPlanningData();
      loadEmployees();
      loadOperations();
      loadAssets();
      loadShift();
      loadInternalWorkOrders();
      setSelectedShift((prev) => ({
        ...prev,
        officeId,
        createdBy: userId || 0,
      }));
    }
  }, [officeId]);

  const showAlert = (type, message) => {
    setAlert({ open: true, type, message });
  };

  const loadInternalWorkOrders = async () => {
    try {
      const data = await getInternalWorkOrdersByOffice(officeId);
      setInternalWorkOrders(data || []);
    } catch {
      showAlert("error", "Failed to load internal work orders");
    }
  };

  const loadPlanningData = async () => {
    try {
      const data = await getAllPlanningByOffice(officeId);
      setPlanningData(Array.isArray(data) ? data : []);
    } catch {
      showAlert("error", "Failed to load planning data");
    }
  };

  // This loads all employees for full list (optional, but keep for initial data)
  const loadEmployees = async () => {
    try {
      const data = await getAllEmployees(officeId);
      setEmployees(Array.isArray(data) ? data : []);
      // Not setting filteredEmployees here because filtered will be loaded by operation
    } catch {
      showAlert("error", "Failed to load employee list");
    }
  };

  const loadShift = async () => {
    try {
      const data = await getAllShift(officeId);
      setShifts(Array.isArray(data) ? data : []);
    } catch {
      showAlert("error", "Failed to load shift list");
    }
  };

  const loadAssets = async () => {
    try {
      const data = await getAllAssets(officeId);
      setAssets(Array.isArray(data) ? data : []);
    } catch {
      showAlert("error", "Failed to load assets");
    }
  };

  const loadOperations = async () => {
    try {
      const data = await getAllOperation(officeId);
      setOperations(Array.isArray(data) ? data : []);
    } catch {
      showAlert("error", "Failed to load operations");
    }
  };

  // Create handler with reset for filtered operations and employees
  const handleCreate = () => {
    setIsEdit(false);
    setSelectedShift({
      ...emptyShift,
      officeId: officeId || 0,
      createdBy: userId || 0,
    });
    setFilteredOperations([]);
    setFilteredEmployees([]);
    setDialogOpen(true);
  };

  // Edit handler - fetch filteredOperations and filteredEmployees by assetId and operationId
  const handleEdit = (entry) => {
    setSelectedShift({ ...entry });
    setIsEdit(true);
    if (entry.assetId) fetchOperationsByAsset(entry.assetId);
    else setFilteredOperations([]);

    if (entry.operationId) fetchEmployeesByOperation(entry.operationId);
    else setFilteredEmployees([]);

    setDialogOpen(true);
  };

  const handleView = (entry) => {
    setViewShift(entry);
    setViewDialogOpen(true);
  };

  const handleDelete = async (entry) => {
    if (window.confirm(`Are you sure you want to delete this shift?`)) {
      try {
        await deletePlanning(entry.id);
        showAlert("success", "Shift deleted successfully");
        loadPlanningData();
      } catch (err) {
        showAlert("error", err?.message || "Failed to delete");
      }
    }
  };

  // General change handler, intercept assetId and operationId changes for dynamic dropdowns
  const handleChange = async (e) => {
    const { name, value } = e.target;

    if (name === "assetId") {
      const assetId = Number(value);
      setSelectedShift((prev) => ({
        ...prev,
        assetId,
        operationId: 0, // reset operationId if asset changes
        employeeId: 0, // reset employeeId if asset changes
      }));
      if (assetId) {
        await fetchOperationsByAsset(assetId);
      } else {
        setFilteredOperations([]);
      }
      setFilteredEmployees([]); // clear employees if asset changes
      return;
    }

    if (name === "operationId") {
      const operationId = Number(value);
      setSelectedShift((prev) => ({
        ...prev,
        operationId,
        employeeId: 0, // reset employeeId when operation changes
      }));
      if (operationId) {
        await fetchEmployeesByOperation(operationId);
      } else {
        setFilteredEmployees([]);
      }
      return;
    }

    setSelectedShift((prev) => ({
      ...prev,
      [name]: name === "achieved" ? Number(value) || 0 : value,
    }));
  };

  // Fetch operations by assetId
  const fetchOperationsByAsset = async (assetId) => {
    setLoadingOperations(true);
    try {
      const data = await getAssetOperation(assetId);
      setFilteredOperations(Array.isArray(data) ? data : []);
    } catch {
      showAlert("error", "Could not load operations for this Machine");
      setFilteredOperations([]);
    }
    setLoadingOperations(false);
  };

  // Fetch employees by operationId
  const fetchEmployeesByOperation = async (operationId) => {
    setLoadingEmployees(true);
    try {
      const data = await getEmployeesByOperation(operationId);
      setFilteredEmployees(Array.isArray(data) ? data : []);
    } catch {
      showAlert("error", "Could not load employees for this Operation");
      setFilteredEmployees([]);
    }
    setLoadingEmployees(false);
  };

  const handleSave = async () => {
    const requiredFields = [
      ["planDate", selectedShift.planDate, "Plan Date is required"],
      ["employeeId", selectedShift.employeeId, "Employee is required"],
      [
        "internalWorkOrderId",
        selectedShift.internalWorkOrderId,
        "Internal Work Order is required",
      ],
      ["assetId", selectedShift.assetId, "Machine is required"],
      ["shiftId", selectedShift.shiftId, "Shift is required"],
      ["operationId", selectedShift.operationId, "Operation is required"],
      ["target", selectedShift.target, "Target is required"],
    ];

    for (const [_, val, msg] of requiredFields) {
      if (!val || (typeof val === "string" && val.trim() === "")) {
        showAlert("error", msg);
        return;
      }
    }

    try {
      if (isEdit) {
        await updatePlanning(selectedShift.id, selectedShift);
        showAlert("success", "Shift updated successfully");
      } else {
        await createPlanning(selectedShift);
        showAlert("success", "Shift added successfully");
      }
      loadPlanningData();
      setDialogOpen(false);
    } catch (err) {
      showAlert("error", err?.message || "Error occurred");
    }
  };

  const filteredPlanningData = planningData.filter((entry) => {
    const employeeName =
      Employees.find((e) => e.employeeId === entry.employeeId)?.employeeName ||
      "";
    const shiftName =
      shifts.find((s) => s.shiftId === entry.shiftId)?.shiftName || "";

    const matchesSearch =
      employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shiftName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDate = selectedDate
      ? entry.planDate?.substring(0, 10) ===
        selectedDate.toISOString().substring(0, 10)
      : true;

    return matchesSearch && matchesDate;
  });

  return (
    <Container maxWidth={false}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h4">Daily Planning Sheet</Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            label="Select Date"
            type="date"
            value={
              selectedDate ? selectedDate.toISOString().substring(0, 10) : ""
            }
            onChange={(e) =>
              setSelectedDate(e.target.value ? new Date(e.target.value) : null)
            }
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            placeholder="Search by employee name or shift"
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
            sx={{ width: 300 }}
          />
          <ExportCSVButton
            data={filteredPlanningData}
            filename="DailyPlanningSheet.csv"
            headers={[
              { label: "ID", key: "id" },
              { label: "Office ID", key: "officeId" },
              { label: "Plan Date", key: "planDate" },
              { label: "Employee ID", key: "employeeId" },
              { label: "Operation ID", key: "operationId" },
              { label: "Asset ID", key: "assetId" },
              { label: "Work Order ID", key: "internalWorkOrderId" },
              { label: "Shift ID", key: "shiftId" },
              { label: "Manpower", key: "manpower" },
              { label: "Target", key: "target" },
              { label: "Achieved", key: "achieved" },
              { label: "Backfeed", key: "backfeed" },
              { label: "Remarks", key: "remarks" },
              { label: "Created By", key: "createdBy" },
              { label: "Created On", key: "createdOn" },
              { label: "Updated By", key: "updatedBy" },
              { label: "Updated On", key: "updatedOn" },
              { label: "Active", key: "isActive" },
            ]}
          />
          <Button variant="contained" size="small" onClick={handleCreate}>
            Create Planning
          </Button>
        </Box>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Plan Date</TableCell>
            <TableCell>Machine Name</TableCell>
            <TableCell>Operator Name</TableCell>
            <TableCell>Manpower</TableCell>
            <TableCell>Internal Work Order</TableCell>
            <TableCell>Shift</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredPlanningData.length > 0 ? (
            filteredPlanningData.map((emp, index) => (
              <TableRow key={emp.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  {emp.planDate ? emp.planDate.substring(0, 10) : ""}
                </TableCell>
                <TableCell>
                  {Assets.find((a) => a.assetId === emp.assetId)?.assetName ||
                    ""}
                </TableCell>
                <TableCell>
                  {Employees.find((e) => e.employeeId === emp.employeeId)
                    ?.employeeName || ""}
                </TableCell>
                <TableCell>{emp.manpower}</TableCell>
                <TableCell>
                  {internalWorkOrders.find(
                    (wo) => wo.id === emp.internalWorkOrderId
                  )?.workOrderName || emp.internalWorkOrderId}
                </TableCell>
                <TableCell>
                  {shifts.find((s) => s.shiftId === emp.shiftId)?.shiftName ||
                    ""}
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="View">
                    <IconButton onClick={() => handleView(emp)} color="info">
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleEdit(emp)} color="primary">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => handleDelete(emp)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} align="center">
                No Planning found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* --- Create/Edit dialog --- */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {isEdit ? "Edit Daily Planning Sheet" : "Create Daily Planning Sheet"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Plan Date"
                name="planDate"
                type="date"
                value={
                  selectedShift.planDate
                    ? selectedShift.planDate.substring(0, 10)
                    : ""
                }
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                select
                label="Shift"
                name="shiftId"
                value={selectedShift.shiftId}
                onChange={handleChange}
                fullWidth
                sx={{ mt: 2 }}
                SelectProps={{ native: true }}
              >
                <option value=""></option>
                {shifts.map((a) => (
                  <option key={a.shiftId} value={a.shiftId}>
                    {a.shiftName}
                  </option>
                ))}
              </TextField>

              <TextField
                select
                label="Machine Name"
                name="assetId"
                value={selectedShift.assetId}
                onChange={handleChange}
                fullWidth
                sx={{ mt: 2 }}
                SelectProps={{ native: true }}
              >
                <option value=""></option>
                {Assets.map((a) => (
                  <option key={a.assetId} value={a.assetId}>
                    {a.assetName}
                  </option>
                ))}
              </TextField>

              <TextField
                fullWidth
                label="Manpower"
                name="manpower"
                value={selectedShift.manpower}
                onChange={handleChange}
                sx={{ mt: 2 }}
              />

              <TextField
                select
                label="Operation Name"
                name="operationId"
                value={selectedShift.operationId}
                onChange={handleChange}
                fullWidth
                sx={{ mt: 2 }}
                SelectProps={{ native: true }}
                disabled={
                  !selectedShift.assetId ||
                  loadingOperations ||
                  !filteredOperations.length
                }
              >
                <option value=""></option>
                {filteredOperations.map((op) => (
                  <option key={op.operationId} value={op.operationId}>
                    {op.operationName}
                  </option>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Employee Name"
                name="employeeId"
                value={selectedShift.employeeId}
                onChange={handleChange}
                fullWidth
                SelectProps={{ native: true }}
                disabled={
                  !selectedShift.operationId ||
                  loadingEmployees ||
                  !filteredEmployees.length
                }
              >
                <option value=""></option>
                {filteredEmployees.map((emp) => (
                  <option key={emp.employeeId} value={emp.employeeId}>
                    {emp.employeeName}
                  </option>
                ))}
              </TextField>

              <TextField
                select
                label="Internal Work Order"
                name="internalWorkOrderId"
                value={selectedShift.internalWorkOrderId}
                onChange={handleChange}
                fullWidth
                sx={{ mt: 2 }}
                SelectProps={{ native: true }}
              >
                <option value=""></option>
                {internalWorkOrders.map((wo) => (
                  <option key={wo.id} value={wo.id}>
                    {wo.workOrderName || wo.id}
                  </option>
                ))}
              </TextField>

              <TextField
                fullWidth
                label="Target (KM)"
                name="target"
                value={selectedShift.target}
                onChange={handleChange}
                sx={{ mt: 2 }}
              />

              <TextField
                fullWidth
                label="Achieved"
                name="achieved"
                type="number"
                value={selectedShift.achieved}
                onChange={handleChange}
                sx={{ mt: 2 }}
              />

              <TextField
                fullWidth
                label="Back Feed (KM)"
                name="backfeed"
                value={selectedShift.backfeed}
                onChange={handleChange}
                sx={{ mt: 2 }}
              />

              <TextField
                fullWidth
                label="Remarks"
                name="remarks"
                value={selectedShift.remarks}
                onChange={handleChange}
                sx={{ mt: 2 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {isEdit ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- View Dialog --- */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>View Daily Planning Sheet</DialogTitle>
        <DialogContent>
          {viewShift && (
            <Table size="small" sx={{ border: "1px solid #ddd" }}>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", width: "30%" }}>
                    Plan Date
                  </TableCell>
                  <TableCell>{viewShift.planDate?.substring(0, 10)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Shift</TableCell>
                  <TableCell>
                    {shifts.find((s) => s.shiftId === viewShift.shiftId)
                      ?.shiftName || ""}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Machine</TableCell>
                  <TableCell>
                    {Assets.find((a) => a.assetId === viewShift.assetId)
                      ?.assetName || ""}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Employee</TableCell>
                  <TableCell>
                    {Employees.find(
                      (e) => e.employeeId === viewShift.employeeId
                    )?.employeeName || ""}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Operation</TableCell>
                  <TableCell>
                    {filteredOperations.find(
                      (o) => o.operationId === viewShift.operationId
                    )?.operationName ||
                      Operations.find(
                        (o) => o.operationId === viewShift.operationId
                      )?.operationName ||
                      ""}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Work Order</TableCell>
                  <TableCell>
                    {internalWorkOrders.find(
                      (wo) => wo.id === viewShift.internalWorkOrderId
                    )?.workOrderName || viewShift.internalWorkOrderId}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Manpower</TableCell>
                  <TableCell>{viewShift.manpower}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Target</TableCell>
                  <TableCell>{viewShift.target}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Achieved</TableCell>
                  <TableCell>{viewShift.achieved}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Backfeed</TableCell>
                  <TableCell>{viewShift.backfeed}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Remarks</TableCell>
                  <TableCell>{viewShift.remarks}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <AlertSnackbar
        open={alert.open}
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ ...alert, open: false })}
      />
    </Container>
  );
};

export default DailyPlanningSheet;
