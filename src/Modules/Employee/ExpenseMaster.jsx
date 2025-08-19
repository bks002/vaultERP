import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

// ✅ Import API service functions
import {
  getExpensesByOffice,
  getExpenseTypesByOffice,
  getExpenseSubtypes,
  createExpenseType,
  updateExpenseType,
  deleteExpense,
} from "../../Services/ExpenseMasterService";

const ExpenseMaster = () => {
  const [expenses, setExpenses] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]); // dynamic from API
  const [subTypes, setSubTypes] = useState([]);

  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [formData, setFormData] = useState({
    id: 0,
    expenseType: "",
    expenseSubType: "",
    dateFrom: "",
    dateTo: "",
    amount: "",
    description: "",
    billImage: "",
    officeId: 0,
    isActive: true,
    createdBy: 0,
    createdOn: 0,
    updatedBy: 0,
    updatedOn: 0,
  });

  const officeId = 1; // Hardcoded for now (can be dynamic)

  // ✅ Load Expenses by office
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const data = await getExpensesByOffice(officeId);
        setExpenses(data);
      } catch (error) {
        console.error("Failed to load expenses:", error);
      }
    };
    fetchExpenses();
  }, [officeId]);

  

  // ✅ Load Expense Types from API
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const data = await getExpenseTypesByOffice(officeId);
        setExpenseTypes(data);
      } catch (error) {
        console.error("Failed to load expense types:", error);
      }
    };
    fetchTypes();
  }, [officeId]);

  // ✅ Load SubTypes when ExpenseType changes
  useEffect(() => {
    const fetchSubTypes = async () => {
      if (formData.expenseType) {
        try {
          const data = await getExpenseSubtypes(officeId, formData.expenseType);
          setSubTypes(data);
        } catch (error) {
          console.error("Failed to load subtypes:", error);
        }
      } else {
        setSubTypes([]);
      }
    };
    fetchSubTypes();
  }, [formData.expenseType]);

  const handleOpen = (mode = "create", data = null) => {
    if (mode === "edit" && data) {
      setFormData(data);
      setViewMode(false);
    } else if (mode === "view" && data) {
      setFormData(data);
      setViewMode(true);
    } else {
      setFormData({
        id: 0,
        expenseType: "",
        expenseSubType: "",
        dateFrom: "",
        dateTo: "",
        amount: "",
        description: "",
        billImage: "",
        officeId: 0,
        isActive: true,
        createdBy: 0,
        createdOn: 0,
        updatedBy: 0,
        updatedOn: 0,
      });
      setViewMode(false);
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
  const { name, value, files } = e.target;
  if (name === "image") {
    setFormData((prev) => ({ ...prev, image: files[0] }));
  } else {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }
};


  const handleDateFromChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      dateFrom: value,
      dateTo: prev.dateTo || value,
    }));
  };

  // ✅ Submit Create / Update with API
// ✅ Submit Create / Update with API
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const handleSubmit = async () => {
  let billImageBase64 = formData.image ? await convertToBase64(formData.image) : "";

  const payload = {
    id: formData.id || 0,
    expenseType: formData.expenseType,
    expenseSubtype: formData.expenseSubType,
    dateFrom: formData.dateFrom ? new Date(formData.dateFrom).toISOString() : null,
    dateTo: formData.dateTo ? new Date(formData.dateTo).toISOString() : null,
    amount: Number(formData.amount) || 0,
    description: formData.description || "",
    billImage: billImageBase64, // Base64 string
    officeId: officeId,
    isActive: true,
    createdBy: 1,
    createdOn: new Date().toISOString(),
    updatedBy: 1,
    updatedOn: new Date().toISOString(),
  };

  await createExpenseType(payload);  // POST request
  const updatedList = await getExpensesByOffice(officeId);
  setExpenses(updatedList);
  handleClose();
};



// ✅ Delete with API
// ✅ Delete with API
const handleDelete = async (id) => {
  try {
    await deleteExpense(id); // <-- ye aapki DELETE API hit karega
    // Delete ke baad list refresh
    const updatedList = await getExpensesByOffice(officeId);
    setExpenses(updatedList);
  } catch (error) {
    console.error("Error deleting expense:", error);
  }
};




  return (
    <div className="col-12">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h4">Expense Master</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpen("create")}
        >
          Create
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Expense Type</TableCell>
              <TableCell>Expense SubType</TableCell>
              <TableCell>Date From</TableCell>
              <TableCell>Date To</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.map((exp) => (
              <TableRow key={exp.id}>
                <TableCell>{exp.expenseType}</TableCell>
                <TableCell>{exp.expenseSubtype}</TableCell>
                <TableCell>{exp.dateFrom}</TableCell>
                <TableCell>{exp.dateTo}</TableCell>
                <TableCell>{exp.amount}</TableCell>
                <TableCell>{exp.description}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen("view", exp)}>
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton onClick={() => handleOpen("edit", exp)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(exp.id)}>
  <DeleteIcon />
</IconButton>

                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {viewMode
            ? "View Expense"
            : formData.id
            ? "Edit Expense"
            : "Create Expense"}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              select
              name="expenseType"
              label="Expense Type"
              value={formData.expenseType}
              onChange={handleChange}
              disabled={viewMode}
              fullWidth
            >
              {expenseTypes.map((et, i) => (
                <MenuItem key={i} value={et.type}>
                  {et.type}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              name="expenseSubType"
              label="Expense SubType"
              value={formData.expenseSubType}
              onChange={handleChange}
              disabled={viewMode || !formData.expenseType}
              fullWidth
            >
              {subTypes.map((st, i) => (
                <MenuItem key={i} value={st}>
                  {st}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              type="date"
              name="dateFrom"
              label="Date From"
              InputLabelProps={{ shrink: true }}
              value={formData.dateFrom}
              onChange={handleDateFromChange}
              disabled={viewMode}
              fullWidth
            />

            <TextField
              type="date"
              name="dateTo"
              label="Date To"
              InputLabelProps={{ shrink: true }}
              value={formData.dateTo}
              onChange={handleChange}
              disabled={viewMode}
              fullWidth
            />

            <TextField
              name="amount"
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              disabled={viewMode}
              fullWidth
            />

            <TextField
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleChange}
              disabled={viewMode}
              fullWidth
              multiline
              rows={2}
            />

            {/* Image Upload / View */}
{!viewMode && (
  <Button variant="outlined" component="label">
    Upload Image
    <input
      type="file"
      hidden
      name="image"
      accept="image/*"
      onChange={handleChange}
    />
  </Button>
)}

{(formData.image || formData.billImage) && (
  <Box mt={1}>
    <Typography variant="body2">Uploaded Image:</Typography>
    <img
      src={
        formData.image
          ? URL.createObjectURL(formData.image) // newly uploaded file
          : formData.billImage // existing image from API (base64)
      }
      alt="Bill"
      style={{ maxWidth: "100%", maxHeight: 200 }}
    />
  </Box>
)}

          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          {!viewMode && (
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {formData.id ? "Update" : "Create"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ExpenseMaster;
