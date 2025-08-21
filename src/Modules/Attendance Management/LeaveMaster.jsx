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
import { useSelector } from 'react-redux';

const LeaveMaster = () => {
  const officeId = useSelector((state) => state.user.officeId);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ leaveType: "", leaveCount: "" });

 // static for now, can make dynamic

  // Fetch leave types on load
  useEffect(() => {
    fetchLeaveTypes();
  }, []);

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
    setFormData({ leaveType: "", leaveCount: "" });
    setOpen(true);
  };

  // Open dialog for edit
  const handleEdit = (row) => {
    setEditingId(row.id);
    setFormData({ leaveType: row.leaveType, leaveCount: row.leaveCount });
    setOpen(true);
  };

  // Delete row
  const handleDelete = async (id) => {
    try {
      await deleteLeaveType(id);
      fetchLeaveTypes();
    } catch (error) {
      alert("Failed to delete leave type!");
    }
  };

  // Save (Create or Update)
   // Save (Create or Update)
  const handleSave = async () => {
    if (!formData.leaveType || !formData.leaveCount) {
      alert("Please fill all fields!");
      return;
    }

    const now = new Date().toISOString();

    const payload = {
      id: editingId ? editingId : 0,
      officeId,
      leaveType: formData.leaveType,
      leaveCount: Number(formData.leaveCount),
      createdOn: now,
      createdBy: 1,   // TODO: replace with logged-in userId if available
      updatedOn: now,
      updatedBy: 1,   // TODO: replace with logged-in userId if available
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
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
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
              <TableCell><b>Leave Type</b></TableCell>
              <TableCell><b>Leave Count</b></TableCell>
              <TableCell><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaveTypes.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{row.leaveType}</TableCell>
                <TableCell>{row.leaveCount}</TableCell>
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
            label="Leave Count"
            type="number"
            fullWidth
            margin="dense"
            value={formData.leaveCount}
            onChange={(e) =>
              setFormData({ ...formData, leaveCount: e.target.value })
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
