import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  OutlinedInput,
  TablePagination,
  Snackbar,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSelector } from "react-redux";

import { getInternalWorkOrdersByOffice } from "../../Services/InternalWorkOrderService";
import { getJobCardsByInternalWo } from "../../Services/JobCard";
import {
  getAllItemIssues,
  getOperationsByJobCardId,
  addItemIssue,
  updateItemIssue,
  deleteItemIssue,
} from "../../Services/ItemIssueService";
import {
  getEmployeesByOperation,
  getAllOperation,
} from "../../Services/OperationService";
import { getItemIdsByInternalWoid } from "../../Services/ConstructionDesignSheet";
import { getItemById } from "../../Services/InventoryService";
import { getEmployeeById } from "../../Services/EmployeeService";

export default function ItemIssues() {
  const officeId = useSelector((state) => state.user.officeId);

  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [itemIssues, setItemIssues] = useState([]);
  const [internalWorkOrders, setInternalWorkOrders] = useState([]);
  const [jobCardIds, setJobCardIds] = useState([]);
  const [operations, setOperations] = useState([]);
  const [employeesOptions, setEmployeesOptions] = useState([]);
  const [itemIds, setItemIds] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState("");

  const [itemIdNameMap, setItemIdNameMap] = useState({});
  const [employeeIdNameMap, setEmployeeIdNameMap] = useState({});

  const [formData, setFormData] = useState({
    inwo: "",
    jobcardId: "",
    operation: "",
    employeeId: "", // keep the ID, not the name
    quantity: "",
  });

  const [formErrors, setFormErrors] = useState({
    inwo: false,
    jobcardId: false,
    operation: false,
    employees: false,
    quantity: false,
    item: false,
  });

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const showToast = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Fetch Work Orders
  useEffect(() => {
    const fetchInternalWorkOrders = async () => {
      try {
        const response = await getInternalWorkOrdersByOffice(officeId);
        setInternalWorkOrders(response.map((inwo) => ({ id: inwo.id })));
      } catch {
        setInternalWorkOrders([]);
      }
    };
    fetchInternalWorkOrders();
  }, [officeId]);

  // Fetch Jobcards
  useEffect(() => {
    const fetchJobCards = async () => {
      if (!formData.inwo) {
        setJobCardIds([]);
        setOperations([]);
        return;
      }
      try {
        const response = await getJobCardsByInternalWo(Number(formData.inwo));
        setJobCardIds(response);
      } catch {
        setJobCardIds([]);
      }
    };
    fetchJobCards();
  }, [formData.inwo]);

  // Fetch Operations
  useEffect(() => {
    const fetchOperations = async () => {
      setOperations([]);
      if (formData.jobcardId) {
        const response = await getOperationsByJobCardId(formData.jobcardId);
        setOperations(response.map((op) => ({ id: op.id, name: op.name })));
      } else if (formData.inwo) {
        const ops = await getAllOperation(officeId);
        setOperations(
          ops.map((op) => ({ id: op.operationId, name: op.operationName }))
        );
      }
    };
    fetchOperations();
  }, [formData.inwo, formData.jobcardId, officeId]);

  // Fetch Employees
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!formData.operation) {
        setEmployeesOptions([]);
        setFormData((prev) => ({ ...prev, employees: "" }));
        return;
      }
      try {
        const operationObj = operations.find(
          (op) => op.name === formData.operation
        );
        if (operationObj?.id) {
          const employees = await getEmployeesByOperation(operationObj.id);
          setEmployeesOptions(employees);
        } else {
          setEmployeesOptions([]);
        }
        setFormData((prev) => ({ ...prev, employees: "" }));
      } catch {
        setEmployeesOptions([]);
      }
    };
    fetchEmployees();
  }, [formData.operation, operations]);

  // Fetch Item Issues and populate maps
  useEffect(() => {
    const fetchItemIssues = async () => {
      try {
        const issues = await getAllItemIssues(officeId);
        setItemIssues(issues);

        const uniqueItemIds = [
          ...new Set(issues.map((i) => i.itemId).filter(Boolean)),
        ];
        const uniqueEmployeeIds = [
          ...new Set(issues.map((i) => i.employeeId).filter(Boolean)),
        ];

        // Map ItemId to Item Name
        const itemNamesMap = {};
        await Promise.all(
          uniqueItemIds.map(async (id) => {
            try {
              const item = await getItemById(id);
              if (item && item.name) itemNamesMap[id] = item.name;
            } catch {}
          })
        );
        setItemIdNameMap(itemNamesMap);

        // Map EmployeeId to Employee Name
        const employeeNamesMap = {};
        await Promise.all(
          uniqueEmployeeIds.map(async (id) => {
            try {
              const emp = await getEmployeeById(id);
              if (emp && emp.employeeName)
                employeeNamesMap[id] = emp.employeeName;
            } catch {}
          })
        );
        setEmployeeIdNameMap(employeeNamesMap);
      } catch {
        setItemIssues([]);
        setItemIdNameMap({});
        setEmployeeIdNameMap({});
      }
    };
    fetchItemIssues();
  }, [officeId]);

  // Fetch Items by INWO
  useEffect(() => {
    if (formData.inwo) {
      getItemIdsByInternalWoid(Number(formData.inwo))
        .then((ids) => {
          setItemIds(Array.isArray(ids) ? ids : []);
          setSelectedItemId("");
        })
        .catch(() => {
          setItemIds([]);
          setSelectedItemId("");
        });
    } else {
      setItemIds([]);
      setSelectedItemId("");
    }
  }, [formData.inwo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "inwo") {
      setFormData({
        inwo: value,
        jobcardId: "",
        operation: "",
        employeeId: "", // keep the ID, not the name
        quantity: "",
      });
      setEmployeesOptions([]);
      setSelectedItemId("");
    } else if (name === "jobcardId") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        operation: "",
        employees: "",
      }));
      setEmployeesOptions([]);
    } else if (name === "operation") {
      setFormData((prev) => ({ ...prev, [name]: value, employees: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEmployeeChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      employees: value,
    }));
  };

  // Simple form validation
  const validateForm = () => {
    const errors = {
      inwo: !formData.inwo,
      jobcardId: false, // optional
      operation: !formData.operation,
      employeeId: !formData.employeeId,
      quantity: !formData.quantity || Number(formData.quantity) <= 0,
         item: !selectedItemId, // <-- validate selectedItemId
    };
    setFormErrors(errors);
    return !Object.values(errors).some((v) => v);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showToast("Please fill all required fields correctly.", "error");
      return;
    }
    try {
      const employeeId = Number(formData.employeeId) || 0;
      const payload = {
        id: editingId || 0,
        inwo: Number(formData.inwo),
        jobcardId: formData.jobcardId ? Number(formData.jobcardId) : 0,
        operation: formData.operation,
        employeeId,
        itemId: selectedItemId ? Number(selectedItemId) : 0,
        quantityIssued: Number(formData.quantity),
        createdBy: 0,
        createdOn: new Date().toISOString(),
        isActive: true,
        officeId,
      };
      if (editMode) {
        await updateItemIssue(editingId, payload);
        showToast("Item Issue updated successfully.", "success");
      } else {
        await addItemIssue(payload);
        showToast("Item Issue added successfully.", "success");
      }
      const issues = await getAllItemIssues(officeId);
      setItemIssues(issues);
      setOpen(false);
      setPage(0);
      setEditMode(false);
      setEditingId(null);
      setFormData({
        inwo: "",
        jobcardId: "",
        operation: "",
        employeeId: "", // keep the ID, not the name
        quantity: "",
      });
      setSelectedItemId("");
      setEmployeesOptions([]);
    } catch (error) {
      console.error("Failed to save item issue:", error.message);
      showToast("Failed to save item issue.", "error");
    }
  };

  // handleEdit
  const handleEdit = async (issue) => {
    setEditMode(true);
    setEditingId(issue.id);
    setFormData({
      inwo: issue.inwo.toString(),
      jobcardId: issue.jobcardId?.toString() || "",
      operation: issue.operation,
      employeeId: issue.employeeId?.toString() || "",
      quantity: issue.quantityIssued.toString(),
    });
    setSelectedItemId(issue.itemId?.toString() || "");
    setOpen(true);

    // Fetch related dropdown data
    if (issue.inwo) {
      try {
        const jobCards = await getJobCardsByInternalWo(Number(issue.inwo));
        setJobCardIds(jobCards);
      } catch {
        setJobCardIds([]);
      }
      try {
        const items = await getItemIdsByInternalWoid(Number(issue.inwo));
        setItemIds(Array.isArray(items) ? items : []);
      } catch {
        setItemIds([]);
      }
    }

    if (issue.jobcardId) {
      try {
        const ops = await getOperationsByJobCardId(issue.jobcardId);
        setOperations(ops.map((op) => ({ id: op.id, name: op.name })));
      } catch {
        setOperations([]);
      }
    } else if (issue.inwo) {
      try {
        const ops = await getAllOperation(officeId);
        setOperations(
          ops.map((op) => ({ id: op.operationId, name: op.operationName }))
        );
      } catch {
        setOperations([]);
      }
    }

    if (issue.operation) {
      try {
        const operationObj = operations.find(
          (op) => op.name === issue.operation
        );
        if (operationObj?.id) {
          const emps = await getEmployeesByOperation(operationObj.id);
          setEmployeesOptions(emps);
          const matched = emps.find(
            (emp) => emp.employeeId === issue.employeeId
          );
          if (matched) {
            setFormData((prev) => ({
              ...prev,
              employees: matched.employeeName,
            }));
          }
        } else {
          setEmployeesOptions([]);
        }
      } catch {
        setEmployeesOptions([]);
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteItemIssue(id);
      setItemIssues((prev) => prev.filter((issue) => issue.id !== id));
      showToast("Item Issue deleted successfully.", "success");
    } catch (error) {
      console.error("Failed to delete item issue:", error.message);
      showToast("Failed to delete item issue.", "error");
    }
  };

  const filteredIssues = itemIssues.filter((issue) =>
    (issue.jobcardId ? issue.jobcardId.toString() : "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );
  const pagedIssues = filteredIssues.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 3 }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5" fontWeight="bold">
          Item Issues
        </Typography>
        <Box display="flex" gap={2}>
          <TextField
            size="small"
            placeholder="Search Job Cards..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setEditMode(false);
              setEditingId(null);
              setFormData({
                inwo: "",
                jobcardId: "",
                operation: "",
                employeeId: "",
                quantity: "",
              });
              setSelectedItemId("");
              setOpen(true);
            }}
          >
            ISSUE ITEM
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <Box sx={{ width: "100%", overflowX: "auto" }}>
        <Table
          sx={{
            border: "1px solid #ccc",
            borderCollapse: "collapse",
            width: "100%",
          }}
        >
          <TableHead>
            <TableRow sx={{ backgroundColor: "#fff" }}>
              <TableCell>#</TableCell>
              <TableCell>Item</TableCell>
              <TableCell>Quantity Issued</TableCell>
              <TableCell>INWO</TableCell>
              <TableCell>Jobcard ID</TableCell>
              <TableCell>Operation</TableCell>
              <TableCell>Employee</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagedIssues.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No items issued yet
                </TableCell>
              </TableRow>
            ) : (
              pagedIssues.map((issue, index) => (
                <TableRow key={issue.id}>
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell>
                    {itemIdNameMap[issue.itemId] || "Unknown"}
                  </TableCell>
                  <TableCell>{issue.quantityIssued}</TableCell>
                  <TableCell>{issue.inwo}</TableCell>
                  <TableCell>{issue.jobcardId}</TableCell>
                  <TableCell>{issue.operation}</TableCell>
                  <TableCell>
                    {employeeIdNameMap[issue.employeeId] || ""}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEdit(issue)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(issue.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredIssues.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Box>

      {/* Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editMode ? "Edit Item Issue" : "Item Issue Form"}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal" error={formErrors.inwo}>
            <InputLabel>Internal Work Order</InputLabel>
            <Select
              name="inwo"
              value={formData.inwo}
              onChange={handleChange}
              label="Internal Work Order"
              disabled={editMode}
            >
              {internalWorkOrders.map(({ id }) => (
                <MenuItem key={id} value={id.toString()}>
                  {id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            fullWidth
            margin="normal"
            error={formErrors.jobcardId}
            disabled={!formData.inwo || jobCardIds.length === 0}
          >
            <InputLabel>Job Card</InputLabel>
            <Select
              name="jobcardId"
              value={formData.jobcardId}
              onChange={handleChange}
              label="Job Card"
            >
              {jobCardIds.map((id) => (
                <MenuItem key={id} value={id.toString()}>
                  {id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            fullWidth
            margin="normal"
            error={formErrors.operation}
            disabled={!formData.inwo /* Removed editMode disable */}
          >
            <InputLabel>Operation</InputLabel>
            <Select
              name="operation"
              value={formData.operation}
              onChange={handleChange}
              label="Operation"
            >
              {operations.map((op) => (
                <MenuItem key={op.id} value={op.name}>
                  {op.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            fullWidth
            margin="normal"
            error={formErrors.employeeId}
            disabled={!formData.operation}
          >
            <InputLabel>Employee</InputLabel>
            <Select
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              label="Employee"
            >
              {employeesOptions.map(({ employeeId, employeeName }) => (
                <MenuItem key={employeeId} value={employeeId.toString()}>
                  {employeeName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            fullWidth
            margin="normal"
            disabled={!formData.inwo || itemIds.length === 0}
            error={formErrors.item}
          >
            <InputLabel>Item</InputLabel>
            <Select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              label="Item"
            >
              {itemIds.map((id) => (
                <MenuItem key={id} value={id.toString()}>
                  {itemIdNameMap[id] || id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            fullWidth
            margin="normal"
            error={formErrors.quantity}
            disabled={!selectedItemId}
          >
            <TextField
              label="Quantity"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              inputProps={{ min: 1 }}
              fullWidth
              error={formErrors.quantity}
              helperText={
                formErrors.quantity
                  ? "Quantity is required and must be > 0"
                  : ""
              }
            />
          </FormControl>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSave}>
            {editMode ? "Update Item" : "Add Item"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
