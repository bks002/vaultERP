import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  InputAdornment,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import AlertSnackbar from "../../Components/Alert/AlertSnackBar";
import { CSVLink } from "react-csv";
import {
  getExpenseTypesByOffice,
  createExpenseType,
  updateExpenseType,
  deleteExpenseType,
} from "../../Services/ExpenseMaster";
import { useSelector } from "react-redux";

const ExpenseTypeMaster = () => {
  const officeId = useSelector((state) => state.user.officeId);
  const userId = useSelector((state) => state.user.userId);

  const [records, setRecords] = useState([]);
  const [alert, setAlert] = useState({ open: false, type: "success", message: "" });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("view");
  const [selectedRecord, setSelectedRecord] = useState({
    type: "",
    subTypes: [],
  });

  // Create Expense Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    type: "",
  });

  // List of added expense sub types before submit
  const [subTypesList, setSubTypesList] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (officeId) {
      setRecords([]);
      fetchExpenses();
    }
  }, [officeId]);

  const fetchExpenses = async () => {
    try {
      const data = await getExpenseTypesByOffice(officeId);
      setRecords(data);
    } catch (err) {
      showAlert("error", "Failed to fetch expense types");
    }
  };

  const showAlert = (type, message) => {
    setAlert({ open: true, type, message });
  };

  const handleView = (record) => {
    setSelectedRecord(record);
    setDialogMode("view");
    setDialogOpen(true);
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDelete = async (record) => {
    if (window.confirm(`Are you sure you want to delete "${record.type}"?`)) {
      try {
        await deleteExpenseType(record.type);
        setRecords(records.filter((r) => r.type !== record.type));
        showAlert("success", "Expense deleted successfully");
      } catch (err) {
        showAlert("error", "Failed to delete expense type");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedRecord({ ...selectedRecord, [name]: value });
  };

  const handleSave = async () => {
    try {
      const updatedData = {
        ...selectedRecord,
        officeId,
        isActive: true,
        createdOn: new Date().toISOString(),
        createdBy: userId,
      };
      await updateExpenseType(selectedRecord.type, updatedData);
      setRecords(records.map((r) => (r.type === selectedRecord.type ? updatedData : r)));
      showAlert("success", "Expense updated successfully");
      setDialogOpen(false);
    } catch (err) {
      showAlert("error", "Failed to update expense type");
    }
  };

  // Open dialog for creating new expense
  const openCreateDialog = () => {
    setCreateDialogOpen(true);
  };

  // Add current sub type input to the list
  const handleAddSubType = (subTypeValue) => {
    if (subTypeValue?.trim()) {
      setSubTypesList([...subTypesList, subTypeValue.trim()]);
    }
  };

  // Handle creating new expense with sub types
  const handleCreateExpense = async () => {
    if (!newExpense.type?.trim()) {
      showAlert("error", "Expense Type is required");
      return;
    }

    const expenseToAdd = {
      type: newExpense.type,
      subTypes: subTypesList,
      officeId,
      isActive: true,
      createdOn: new Date().toISOString(),
      createdBy: userId,
    };

    try {
      await createExpenseType(expenseToAdd);
      setRecords([...records, expenseToAdd]);
      showAlert("success", "Expense created successfully");
      setCreateDialogOpen(false);
      setNewExpense({ type: "" });
      setSubTypesList([]); // reset sub types list
    } catch (err) {
      showAlert("error", "Failed to create expense type");
    }
  };

  // Filter records based on search query
  const filteredRecords = records.filter(
    (rec) =>
      rec.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.subTypes?.some((st) => st.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // CSV Headers
  const csvHeaders = [
    { label: "Expense Type", key: "type" },
    { label: "Expense Sub Types", key: "subTypes" },
  ];

  return (
    <Container maxWidth={false}>
      {/* Heading + Search + Button in Same Row */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2, gap: 2 }}>
        <Typography variant="h4">Expense Master</Typography>

        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            sx={{ width: "310px" }}
            placeholder="Search by Expense Type and Sub Type"
            variant="outlined"
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
          />

          <CSVLink data={filteredRecords} headers={csvHeaders} filename="expenses.csv" style={{ textDecoration: "none" }}>
            <Button variant="outlined" color="secondary">Export to CSV</Button>
          </CSVLink>

          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
            Create New Expense
          </Button>
        </Box>
      </Box>

      {/* Main Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Expense Type</TableCell>
            <TableCell>Expense Sub Types</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {filteredRecords.length > 0 ? (
            filteredRecords.map((rec, index) => (
              <TableRow key={rec.type}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{rec.type}</TableCell>
                <TableCell>
                  {rec.subTypes && rec.subTypes.length > 0 ? rec.subTypes.join(", ") : "-"}
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="View">
                    <IconButton onClick={() => handleView(rec)} color="info">
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleEdit(rec)} color="primary">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => handleDelete(rec)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} align="center">No matching records found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* View/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{dialogMode === "view" ? "View Expense" : "Edit Expense"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Expense Type"
              name="type"
              value={selectedRecord.type}
              onChange={handleChange}
              disabled={dialogMode === "view"}
              fullWidth
            />
            <TextField
              label="Expense Sub Types (comma separated)"
              value={selectedRecord.subTypes?.join(", ") || ""}
              onChange={(e) =>
                setSelectedRecord({ ...selectedRecord, subTypes: e.target.value.split(",").map((s) => s.trim()) })
              }
              disabled={dialogMode === "view"}
              fullWidth
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          {dialogMode === "edit" && <Button variant="contained" onClick={handleSave}>Save</Button>}
        </DialogActions>
      </Dialog>

      {/* Create New Expense Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create New Expense</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Expense Type"
              name="type"
              value={newExpense.type}
              onChange={(e) => setNewExpense({ ...newExpense, type: e.target.value })}
              fullWidth
            />

            <Box display="flex" alignItems="center" gap={1}>
              <TextField
                label="Expense Sub Type"
                name="subType"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSubType(e.target.value);
                    e.target.value = "";
                  }
                }}
                fullWidth
              />
              <Box>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    const input = document.querySelector('input[name="subType"]');
                    handleAddSubType(input.value);
                    input.value = "";
                  }}
                  sx={{ minWidth: '70px' }}
                >
                  Add
                </Button>
              </Box>
            </Box>

            {subTypesList.length > 0 && (
              <Table size="small" sx={{ mt: 1 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Added Expense Sub Types</TableCell>
                    <TableCell align="right">Remove</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subTypesList.map((subType, index) => (
                    <TableRow key={index}>
                      <TableCell>{subType}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => setSubTypesList(subTypesList.filter((_, i) => i !== index))}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateExpense}>Create</Button>
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

export default ExpenseTypeMaster;
