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
    // ✅ edit mode ke liye subTypes fetch karke set karo
    const fetchSubTypesForEdit = async () => {
      if (data.expenseType) {
        try {
          const subs = await getExpenseSubtypes(officeId, data.expenseType);
          setSubTypes(subs); // dropdown ke liye set
          setFormData({
            ...data,
            dateFrom: data.dateFrom ? data.dateFrom.split("T")[0] : "",
            dateTo: data.dateTo ? data.dateTo.split("T")[0] : "",
            expenseSubType: data.expenseSubType || (subs[0] || ""), // fallback
          });
        } catch (error) {
          console.error("Failed to load subtypes for edit:", error);
        }
      } else {
        setSubTypes([]);
        setFormData({
          ...data,
          dateFrom: data.dateFrom ? data.dateFrom.split("T")[0] : "",
          dateTo: data.dateTo ? data.dateTo.split("T")[0] : "",
        });
      }
    };
    fetchSubTypesForEdit();
    setViewMode(false);
  } else if (mode === "view" && data) {
    const matchingSubType = subTypes.includes(data.expenseSubType)
      ? data.expenseSubType
      : data.expenseSubType || "";

    setFormData({
      ...data,
      dateFrom: data.dateFrom ? data.dateFrom.split("T")[0] : "",
      dateTo: data.dateTo ? data.dateTo.split("T")[0] : "",
      expenseSubType: matchingSubType,
    });
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
      billImage: billImageBase64 || formData.billImage,
      officeId: officeId,
      isActive: true,
      createdBy: 1,
      createdOn: new Date().toISOString(),
      updatedBy: 1,
      updatedOn: new Date().toISOString(),
    };
if (formData.id) {
  await updateExpenseType(payload); // PUT request with proper ID
} else {
  await createExpenseType(payload); // POST request
}


    const updatedList = await getExpensesByOffice(officeId);
    setExpenses(updatedList);
    handleClose();
  };

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id);
      const updatedList = await getExpensesByOffice(officeId);
      setExpenses(updatedList);
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  return (
    <div className="col-12">
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4">Expense Master</Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpen("create")}>
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
                <TableCell>{exp.dateFrom?.split("T")[0]}</TableCell>
                <TableCell>{exp.dateTo?.split("T")[0]}</TableCell>
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
          {viewMode ? "View Expense" : formData.id ? "Edit Expense" : "Create Expense"}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {/* Expense Type */}
            {viewMode ? (
              <TextField
                label="Expense Type"
                value={formData.expenseType}
                fullWidth
                disabled={true}
              />
            ) : (
              <TextField
                select
                name="expenseType"
                label="Expense Type"
                value={formData.expenseType}
                onChange={handleChange}
                fullWidth
              >
                {expenseTypes.map((et, i) => (
                  <MenuItem key={i} value={et.type}>
                    {et.type}
                  </MenuItem>
                ))}
              </TextField>
            )}

            {/* Expense SubType */}
            {viewMode ? (
             <TextField
                label="Expense SubType"
                value={formData.expenseSubType || formData.expenseSubtype || ""} // fallback for API
                fullWidth
                disabled={true} 
              />
            ) : (
              <TextField
                select
                name="expenseSubType"
                label="Expense SubType"
                value={formData.expenseSubType}
                onChange={handleChange}
                fullWidth
                disabled={!formData.expenseType}
              >
                {subTypes.map((st, i) => (
                  <MenuItem key={i} value={st}>
                    {st}
                  </MenuItem>
                ))}
              </TextField>
            )}

            {/* Dates */}
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
                <input type="file" hidden name="image" accept="image/*" onChange={handleChange} />
              </Button>
            )}

            {(formData.image || formData.billImage) && (
              <Box mt={1}>
                <Typography variant="body2">Uploaded Image:</Typography>
                <img
                  src={
                    formData.image
                      ? URL.createObjectURL(formData.image)
                      : `data:image/jpeg;base64,${formData.billImage}`
                  }
                  alt="Bill"
                  style={{ maxWidth: "100%", maxHeight: 200, cursor: viewMode ? "pointer" : "default" }}
                  onClick={() => {
                    if (viewMode && formData.billImage) {
                      const newWindow = window.open();
                      newWindow.document.write(
                        `<img src="data:image/jpeg;base64,${formData.billImage}" style="width:100%">`
                      );
                    }
                  }}
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
