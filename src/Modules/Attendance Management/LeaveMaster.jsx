import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import {
  getAllLeaveTypes,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType,
} from "../../Services/LeaveMasterService";
import { useSelector } from "react-redux";

const LeaveMaster = () => {
  const officeId = useSelector((state) => state.user.officeId);
  const userId = useSelector((state) => state.user.userId);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    leaveType: "",
    leaveDescription: "",
  });

  // Fetch leave types on load
  useEffect(() => {
    if (officeId) fetchLeaveTypes();
    else setLeaveTypes([]);
  }, [officeId]);

  const fetchLeaveTypes = async () => {
    try {
      const data = await getAllLeaveTypes(officeId);
      setLeaveTypes(data);
    } catch (error) {
      console.error("Failed to load leave types:", error);
    }
  };

  // Open dialog for create
  const handleCreate = () => {
    setEditingId(null);
<<<<<<< HEAD
    setFormData({ leaveType: "", leaveCount: "" });
=======
    setFormData({ leaveType: "", leaveDescription: "" });
>>>>>>> 5058cb740d86dca4665d6e66eb9a58b4e28ba6e3
    setOpen(true);
  };

  // Open dialog for edit
  const handleEdit = (row) => {
    setEditingId(row.id);
    setFormData({
      leaveType: row.leaveType,
      leaveDescription: row.leaveDescription,
    });
    setOpen(true);
  };

  // Delete row
  const handleDelete = async (id) => {
    try {
      await deleteLeaveType(id);
      fetchLeaveTypes(officeId);
    } catch (error) {
      alert("Failed to delete leave type!");
    }
  };

  // Save (Create or Update)
  const handleSave = async () => {
    if (!formData.leaveType || !formData.leaveDescription) {
      alert("Please fill all fields!");
      return;
    }

    const now = new Date().toISOString();

    const payload = {
      id: editingId ? editingId : 0,
      officeId,
      leaveType: formData.leaveType,
      leaveDescription: formData.leaveDescription,
      createdOn: now,
      createdBy: userId, // TODO: replace with logged-in userId
      updatedOn: now,
      updatedBy: userId, // TODO: replace with logged-in userId
      isActive: true,
    };

    try {
      if (editingId) {
        await updateLeaveType(editingId, payload);
      } else {
        await createLeaveType(payload);
      }
      fetchLeaveTypes();
      setOpen(false);
    } catch (error) {
      alert("Error saving leave type!");
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
        <Typography variant="h4">Leave Master</Typography>
        <Button variant="contained" color="primary" onClick={handleCreate}>
          Create New Leave Type
        </Button>
      </Box>

      {/* Table */}
      <Paper sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>
                <b>Leave Type</b>
              </TableCell>
              <TableCell>
                <b>Description</b>
              </TableCell>
              <TableCell>
                <b>Actions</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaveTypes.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{row.leaveType}</TableCell>
                <TableCell>{row.leaveDescription}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleEdit(row)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(row.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {leaveTypes.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No leave types available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Dialog Form */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingId ? "Edit Leave Type" : "Create Leave Type"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Leave Type"
            fullWidth
            margin="dense"
            value={formData.leaveType}
            onChange={(e) =>
              setFormData({ ...formData, leaveType: e.target.value })
            }
          />
          <TextField
            label="Description"
            fullWidth
            margin="dense"
            multiline
            minRows={2}
            value={formData.leaveDescription}
            onChange={(e) =>
              setFormData({ ...formData, leaveDescription: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editingId ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default LeaveMaster;
