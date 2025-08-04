import React, { useState, useEffect } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, Button, IconButton, InputAdornment, Typography
} from '@mui/material';
import SearchIcon from "@mui/icons-material/Search";
import { Check, Close } from '@mui/icons-material';
import axios from 'axios';

const Leave = () => {
  const [leaveData, setLeaveData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // ✅ Fetch leaves on component mount
  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await axios.get("https://localhost:7093/api/LeaveRequest/get-leaves/office/1");
      setLeaveData(response.data);
    } catch (error) {
      console.error("Error fetching leaves:", error);
    }
  };

  // ✅ Handle approve/reject action
  const handleAction = async (leaveId, type) => {
    try {
      const approve = type === 'approve';

      await axios.post(`https://localhost:7093/api/LeaveRequest/approve-leave/${leaveId}`, {
        isApproved: approve,
        isRejected: !approve,
      });

      // ✅ Update local state after successful API call
      const updated = leaveData.map(item =>
        item.leaveId === leaveId
          ? { ...item, isApproved: approve ? "Yes" : "No", isRejected: !approve ? "Yes" : "No" }
          : item
      );
      setLeaveData(updated);
    } catch (error) {
      console.error(`Error ${type === 'approve' ? "approving" : "rejecting"} leave:`, error);
    }
  };

  // 🔍 Filter search
  const filteredData = leaveData.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4">Leave</Typography>
        <TextField
          placeholder="Search by..."
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
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Employee Name</strong></TableCell>
              <TableCell><strong>From Date</strong></TableCell>
              <TableCell><strong>To Date</strong></TableCell>
              <TableCell><strong>Reason</strong></TableCell>
              <TableCell><strong>Leave Type</strong></TableCell>
              <TableCell><strong>Is Approved</strong></TableCell>
              <TableCell><strong>Is Rejected</strong></TableCell>
              <TableCell><strong>Action</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.employeeName}</TableCell>
                <TableCell>{row.fromDate}</TableCell>
                <TableCell>{row.toDate}</TableCell>
                <TableCell>{row.reason}</TableCell>
                <TableCell>{row.leaveType}</TableCell>
                <TableCell>{row.isApproved === true ? "Yes" : "No"}</TableCell>
                <TableCell>{row.isRejected === true ? "Yes" : "No"}</TableCell>
                <TableCell>
                  <IconButton
                    color="success"
                    onClick={() => handleAction(row.leaveId, 'approve')}
                  >
                    <Check />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleAction(row.leaveId, 'reject')}
                  >
                    <Close />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filteredData.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">No data found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Leave;
