import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Paper,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const jobTypes = [
  { value: "", label: "Select" },
  { value: "23-Yoga Instructor (Staff)", label: "Yoga Instructor" },
  { value: "34-Technical Staff", label: "Technical" },
  { value: "19-House Keeping", label: "Housekeeping" },
  { value: "21-Plumber (Staff)", label: "Plumbing" },
  { value: "37-Lift Man", label: "Lifts" },
];

const TicketCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5);
  const [open, setOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [formState, setFormState] = useState({
    jobType: "",
    description: "",
  });

  const fetchCategories = async () => {
    try {
      const response = await fetch("https://admin.urest.in:8089/api/complaint/TicketType", {
        headers: { Accept: "*/*" },
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        console.error("Failed to fetch categories", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpen = () => {
    setIsEditMode(false);
    setEditingCategoryId(null);
    setFormState({ jobType: "", description: "" });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setIsEditMode(false);
    setEditingCategoryId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ticketTypeId: isEditMode ? editingCategoryId : 0,
      type: formState.jobType,
      description: formState.description,
      status: 0,
      createdBy: 0,
      createdOn: new Date().toISOString(),
      isDeleted: 0,
    };

    try {
      const method = isEditMode ? "PUT" : "POST";
      const url = isEditMode
        ? `https://admin.urest.in:8089/api/complaint/TicketType/${editingCategoryId}`
        : "https://admin.urest.in:8089/api/complaint/TicketType";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(`Category ${isEditMode ? "updated" : "created"} successfully!`);
        handleClose();
        setFormState({ jobType: "", description: "" });
        fetchCategories();
      } else {
        alert(`Failed to ${isEditMode ? "update" : "create"} category`);
      }
    } catch (error) {
      alert(`Error ${isEditMode ? "updating" : "creating"} category`);
    }
  };

  const handleEdit = (cat) => {
    setIsEditMode(true);
    setEditingCategoryId(cat.ticketTypeId);
    setFormState({
      jobType: cat.type || "",
      description: cat.description || "",
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        const response = await fetch(`https://admin.urest.in:8089/api/complaint/TicketType/${id}`, {
          method: "DELETE",
          headers: { Accept: "*/*" },
        });
        if (response.ok) {
          alert("Category deleted successfully!");
          fetchCategories();
        } else {
          alert("Failed to delete category");
        }
      } catch (error) {
        alert("Error deleting category");
      }
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <Container maxWidth={false}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ my: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Ticket Categories
        </Typography>
        <Button
          variant="contained"
          color="success"
          startIcon={<AddIcon />}
          sx={{ textTransform: "none" }}
          onClick={handleOpen}
        >
          Create New
        </Button>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell><strong>Job Type</strong></TableCell>
              <TableCell align="center"><strong>Action</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((cat) => (
                <TableRow key={cat.ticketTypeId}>
                  <TableCell>{cat.ticketTypeId}</TableCell>
                  <TableCell>{cat.description}</TableCell>
                  <TableCell>{jobTypes.find((jt) => jt.value === cat.type)?.label || cat.type}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit">
                      <IconButton color="info" onClick={() => handleEdit(cat)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton color="error" onClick={() => handleDelete(cat.ticketTypeId)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <Box display="flex" justifyContent="flex-end">
          <TablePagination
            component="div"
            count={categories.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[]}
          />
        </Box>
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold" }}>
          {isEditMode ? "Edit Category" : "Create New Category"}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <Box mb={2}>
              <FormControl fullWidth size="small" required>
                <InputLabel id="job-type-label">Job Type</InputLabel>
                <Select
                  labelId="job-type-label"
                  id="jobType"
                  name="jobType"
                  value={formState.jobType}
                  onChange={handleChange}
                  label="Job Type"
                >
                  {jobTypes.map((jt) => (
                    <MenuItem key={jt.value} value={jt.value}>
                      {jt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box mb={2}>
              <TextField
                label="Description"
                name="description"
                value={formState.description}
                onChange={handleChange}
                size="small"
                placeholder="Description"
                fullWidth
              />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button
                variant="contained"
                color="success"
                type="submit"
                sx={{ textTransform: "none", mr: 1 }}
              >
                Save
              </Button>
              <Button variant="outlined" onClick={handleClose} sx={{ textTransform: "none" }}>
                Cancel
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default TicketCategoriesPage;
