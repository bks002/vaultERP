import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Stack,
} from "@mui/material";
import { useSelector } from "react-redux";
import { fetchLeaves, approveLeave } from "../../Services/LeaveService";

const Leave = () => {
    const officeId = useSelector((state) => state.user.officeId);
  const [leaveData, setLeaveData] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  // Fetch data on mount
  useEffect(() => {
    const loadLeaves = async () => {
      try {
        const data = await fetchLeaves(officeId); // Replace with dynamic officeId if needed
        setLeaveData(
  data.map((item) => ({
    ...item,
    isApproved: item.isApproved === "Yes" || item.isApproved === true,
    isRejected: item.isRejected === "Yes" || item.isRejected === true,
  }))
);

      } catch (err) {
        console.error("Error loading leaves:", err.message);
      }
    };
    loadLeaves();
  }, [officeId]);

  const handleView = (leave) => {
    setSelectedLeave(leave);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedLeave(null);
  };

  const handleAction = async (index, type) => {
  const leave = leaveData[index];
  const isApproved = type === "approve";

  try {
    await approveLeave(leave.leaveId, isApproved);

    const updated = leaveData.map((item, i) =>
      i === index
        ? {
            ...item,
            isApproved: isApproved,
            isRejected: !isApproved,
          }
        : item
    );

    setLeaveData(updated);
  } catch (err) {
    console.error("Approval failed:", err.message);
  }
};


  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Leave Management
      </Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Employee</TableCell>
            <TableCell>From</TableCell>
            <TableCell>To</TableCell>
            <TableCell>Reason</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
       <TableBody>
  {leaveData.map((row, index) => (
   <TableRow
  key={index}
  sx={{
    backgroundColor: row.isApproved ? "#d0f0c0" : "inherit",
  }}
>

      <TableCell>{row.mobileNo || "-"}</TableCell>
      <TableCell>{row.fromDate}</TableCell>
      <TableCell>{row.toDate}</TableCell>
      <TableCell>{row.reason}</TableCell>
      <TableCell>{row.leaveType}</TableCell>
      <TableCell>
       {row.isApproved
  ? "Approved"
  : row.isRejected
  ? "Rejected"
  : "Pending"}

      </TableCell>
      <TableCell>
        <Button
  variant="outlined"
  color={row.isApproved ? "success" : "inherit"}
  onClick={() => handleAction(index, "approve")}
  disabled={row.isApproved}
>
  ✔
</Button>

      </TableCell>
    </TableRow>
  ))}
</TableBody>

      </Table>

      {/* View Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Leave Details</DialogTitle>
        <DialogContent dividers>
          {selectedLeave && (
            <Box>
              <Typography><strong>Employee:</strong> {selectedLeave.mobileNo}</Typography>  
              <Typography><strong>Employee:</strong> {selectedLeave.mobileNo}</Typography>
              <Typography><strong>From:</strong> {selectedLeave.fromDate}</Typography>
              <Typography><strong>To:</strong> {selectedLeave.toDate}</Typography>
              <Typography><strong>Type:</strong> {selectedLeave.leaveType}</Typography>
              <Typography><strong>Reason:</strong> {selectedLeave.reason}</Typography>
              <Typography><strong>Status:</strong> 
  {selectedLeave.isApproved
    ? "Approved"
    : selectedLeave.isRejected
    ? "Rejected"
    : "Pending"}
</Typography>

            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Leave;
