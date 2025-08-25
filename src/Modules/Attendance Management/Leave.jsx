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
    TextField,
    Container,
    InputAdornment,
    MenuItem,
    Stack,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useSelector } from "react-redux";
import {
    fetchLeaves,
    approveLeave,
    rejectLeave,
    fetchLeaveBalance,
    applyLeave,
} from "../../Services/LeaveService";
import { getAllEmployees } from "../../Services/EmployeeService";     // ✅ Employee API
import { getAllLeaveTypes } from "../../Services/LeaveMasterService"; // ✅ Leave Type API (same as LeaveMaster)
import ExportCSVButton from "../../Components/Export to CSV/ExportCSVButton";

const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-IN");

const Leave = () => {
    const officeId = useSelector((state) => state.user.officeId);
    const [leaveBalance, setLeaveBalance] = useState([]);
    const [leaveData, setLeaveData] = useState([]);
    const [employees, setEmployees] = useState([]);   // ✅ Employees
    const [leaveTypes, setLeaveTypes] = useState([]); // ✅ Leave Types

    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [newLeave, setNewLeave] = useState({
        employeeId: "",
        fromDate: "",
        toDate: "",
        reason: "",
        leaveType: "",
    });

    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [rejectionRemark, setRejectionRemark] = useState("");
    const [searchQuery, setSearchQuery] = useState("");


// ✅ Utility: Calculate no. of days between two dates
const calculateDays = (from, to) => {
    const start = new Date(from);
    const end = new Date(to);
    const diff = (end - start) / (1000 * 60 * 60 * 24) + 1; // inclusive
    return diff > 0 ? diff : 0;
};

// ✅ Handle From Date
const handleFromDateChange = (value) => {
    setNewLeave({ ...newLeave, fromDate: value, toDate: "" }); 
};

// ✅ Handle To Date with validation
const handleToDateChange = (value) => {
    const days = calculateDays(newLeave.fromDate, value);

    // Find selected leave type balance
    const selectedLeave = leaveBalance.find(
        (lb) => lb.leaveType === newLeave.leaveType
    );

    if (selectedLeave && days > selectedLeave.remainingLeaves) {
        alert(
            `You cannot apply more than ${selectedLeave.remainingLeaves} days for ${selectedLeave.leaveType}`
        );
        return; // ❌ Prevent setting invalid toDate
    }

    setNewLeave({ ...newLeave, toDate: value });
};


    // Employee select change handler
const handleEmployeeChange = async (employeeId) => {
    setNewLeave({ ...newLeave, employeeId });

    const selectedEmployee = employees.find(
        (emp) => emp.employeeId === employeeId
    );

    if (selectedEmployee?.email) {
        try {
            const balance = await fetchLeaveBalance(selectedEmployee.email);
            setLeaveBalance(balance);
        } catch (err) {
            console.error("Failed to load leave balance:", err.message);
            setLeaveBalance([]);
        }
    } else {
        setLeaveBalance([]);
    }
};
    // Load all required data
    useEffect(() => {
        const loadLeaves = async () => {
            try {
                const data = await fetchLeaves(officeId);
                setLeaveData(data);
            } catch (err) {
                console.error("Error loading leaves:", err.message);
            }
        };
        const loadEmployees = async () => {
            try {
                const data = await getAllEmployees(officeId);
                setEmployees(data);
            } catch {
                console.error("Failed to load employees");
            }
        };




        const loadLeaveTypes = async () => {
            try {
                const data = await getAllLeaveTypes(officeId); // ✅ same call as LeaveMaster
                setLeaveTypes(data);
            } catch {
                console.error("Failed to load leave types");
            }
        };

        if (officeId) {
            loadLeaves();
            loadEmployees();
            loadLeaveTypes();
        }
    }, [officeId]);

    // Approve Leave
    const handleApprove = async (index) => {
        const leave = leaveData[index];
        try {
            await approveLeave(leave.leaveId);
            const updated = leaveData.map((item, i) =>
                i === index
                    ? { ...item, status: "Approved", rejectionRemarks: null }
                    : item
            );
            setLeaveData(updated);
        } catch (err) {
            console.error("Approval failed:", err.message);
        }
    };

    // Reject Leave
    const handleRejectClick = (index) => {
        setSelectedIndex(index);
        setRejectionRemark("");
        setRejectDialogOpen(true);
    };

    const handleRejectSubmit = async () => {
        const leave = leaveData[selectedIndex];
        try {
            await rejectLeave(leave.leaveId, rejectionRemark);
            const updated = leaveData.map((item, i) =>
                i === selectedIndex
                    ? {
                          ...item,
                          status: "Rejected",
                          rejectionRemarks: rejectionRemark,
                      }
                    : item
            );
            setLeaveData(updated);
            setRejectDialogOpen(false);
        } catch (err) {
            console.error("Rejection failed:", err.message);
        }
    };

    // Search
    const filteredData = leaveData.filter((leave) =>
        leave.employeeName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // CSV Export
    const csvHeaders = [
        { label: "Employee Name", key: "employeeName" },
        { label: "From Date", key: "fromDate" },
        { label: "To Date", key: "toDate" },
        { label: "Leave Type", key: "leaveType" },
        { label: "Reason", key: "reason" },
        { label: "Status", key: "status" },
        { label: "Rejection Remarks", key: "rejectionRemarks" },
    ];

    const csvData = filteredData.map((row) => ({
        ...row,
        fromDate: formatDate(row.fromDate),
        toDate: formatDate(row.toDate),
    }));

    return (
        <Container maxWidth={false}>
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
            >
                <Typography variant="h4">Leave Management</Typography>
                <Box display="flex" alignItems="center" gap={2}>
                    <TextField
                        placeholder="Search by employee name"
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
                        data={csvData}
                        filename="Leave Management.csv"
                        headers={csvHeaders}
                    />
                    {/* ✅ Create Button */}
                    <Button
                        variant="contained"
                        onClick={() => setCreateDialogOpen(true)}
                    >
                        Create Leave
                    </Button>
                </Box>
            </Box>

            {/* ✅ Create Leave Dialog */}
            <Dialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                fullWidth
                maxWidth="sm"
                 keepMounted={false} 
            >
                <DialogTitle>Create Leave</DialogTitle>
                <DialogContent>
    <Stack spacing={2} mt={1}>
        {/* Employee Dropdown */}
        <TextField
            select
            label="Employee"
            value={newLeave.employeeId}
            onChange={(e) => handleEmployeeChange(e.target.value)}
            fullWidth
        >
            {employees.map((emp) => (
                <MenuItem key={emp.employeeId} value={emp.employeeId}>
                    {emp.employeeName}
                </MenuItem>
            ))}
        </TextField>

       {/* From Date */}
<TextField
    type="date"
    label="From Date"
    value={newLeave.fromDate}
    onChange={(e) => handleFromDateChange(e.target.value)}
    fullWidth
    InputLabelProps={{ shrink: true }}
/>

{/* To Date */}
<TextField
    type="date"
    label="To Date"
    value={newLeave.toDate}
    onChange={(e) => handleToDateChange(e.target.value)}
    fullWidth
    InputLabelProps={{ shrink: true }}
    disabled={!newLeave.fromDate || !newLeave.leaveType} // ✅ disable until fromDate + leaveType selected
/>


        {/* Reason */}
        <TextField
            label="Reason"
            value={newLeave.reason}
            onChange={(e) =>
                setNewLeave({
                    ...newLeave,
                    reason: e.target.value,
                })
            }
            fullWidth
        />

        {/* Leave Type Dropdown */}
        <TextField
            select
            label="Leave Type"
            value={newLeave.leaveType}
            onChange={(e) =>
                setNewLeave({
                    ...newLeave,
                    leaveType: e.target.value,
                })
            }
            fullWidth
        >
            {leaveTypes.map((lt) => (
                <MenuItem key={lt.id} value={lt.id}>
                    {lt.leaveType}
                </MenuItem>
            ))}
        </TextField>
    </Stack>

    {/* ✅ Show Leave Balance Table only inside Dialog */}
    {leaveBalance.length > 0 && (
        <Box mt={2}>
            <Typography variant="h6" gutterBottom>
                Leave Balance
            </Typography>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Leave Type</TableCell>
                        <TableCell>Taken Leaves</TableCell>
                        <TableCell>Remaining Leaves</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {leaveBalance.map((lb, index) => (
                        <TableRow key={index}>
                            <TableCell>{lb.leaveType}</TableCell>
                            <TableCell>{lb.takenLeaves}</TableCell>
                            <TableCell>{lb.remainingLeaves}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Box>
    )}
</DialogContent>

                <DialogActions>
                    <Button onClick={() => setCreateDialogOpen(false)}>
                        Cancel
                    </Button>
                <Button
    variant="contained"
    onClick={async () => {
        try {
            // ✅ Calculate leave count
            const leaveCount = calculateDays(newLeave.fromDate, newLeave.toDate);

            // ✅ Find selected leaveType object
            const selectedLeaveType = leaveTypes.find(
                (lt) => lt.id === newLeave.leaveType
            );

            // ✅ Find leave balance for this leave type
            const selectedBalance = leaveBalance.find(
                (lb) => lb.leaveType === selectedLeaveType?.leaveType
            );

            // ❌ Validation 1: if leaveCount > remainingLeaves → reject
            if (selectedBalance && leaveCount > selectedBalance.remainingLeaves) {
                alert(
                    `You cannot apply more than ${selectedBalance.remainingLeaves} days for ${selectedBalance.leaveType}.`
                );
                return;
            }

            // ❌ Validation 2: check overlap with already applied leaves
            const newFrom = new Date(newLeave.fromDate);
            const newTo = new Date(newLeave.toDate);

            const hasOverlap = leaveData.some((leave) => {
                const existingFrom = new Date(leave.fromDate);
                const existingTo = new Date(leave.toDate);

                // overlap condition
                return newFrom <= existingTo && newTo >= existingFrom;
            });

            if (hasOverlap) {
                alert(
                    "You have already applied leave within this date range. Please select a different date."
                );
                return;
            }

            // ✅ Prepare payload for API
            const payload = {
                employeeId: newLeave.employeeId,
                fromDate: newLeave.fromDate,
                toDate: newLeave.toDate,
                reason: newLeave.reason,
                leaveType: selectedLeaveType ? selectedLeaveType.leaveType : "",
                leaveTypeId: newLeave.leaveType,
                leaveCount,
                mobileNo: "9999999999",
            };

            await applyLeave(payload);

            // ✅ Refresh leaves for dashboard
            const updatedLeaves = await fetchLeaves(officeId);
            setLeaveData(updatedLeaves);

            setCreateDialogOpen(false);
            setNewLeave({
                employeeId: "",
                fromDate: "",
                toDate: "",
                reason: "",
                leaveType: "",
            });
        } catch (err) {
            console.error("Failed to create leave:", err.message);
        }
    }}
>
    Save
</Button>




                </DialogActions>
            </Dialog>

            {/* ✅ Leave Table */}
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Employee</TableCell>
                        <TableCell>From</TableCell>
                        <TableCell>To</TableCell>
                        <TableCell>Reason</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Remark</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredData.map((row, index) => (
                        <TableRow key={index}>
                            <TableCell>{row.employeeName || "-"}</TableCell>
                            <TableCell>{formatDate(row.fromDate)}</TableCell>
                            <TableCell>{formatDate(row.toDate)}</TableCell>
                            <TableCell>{row.reason}</TableCell>
                            <TableCell>{row.leaveType}</TableCell>
                            <TableCell>{row.status}</TableCell>
                            <TableCell>
                                {row.rejectionRemarks || "-"}
                            </TableCell>
                            <TableCell>
                                <Button
                                    variant="outlined"
                                    color="success"
                                    onClick={() => handleApprove(index)}
                                    disabled={row.status === "Approved"}
                                >
                                    ✔
                                </Button>{" "}
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() => handleRejectClick(index)}
                                    disabled={row.status === "Rejected"}
                                >
                                    ✖
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

          


            {/* Reject Dialog */}
            <Dialog
                open={rejectDialogOpen}
                onClose={() => setRejectDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Rejection Remark</DialogTitle>
                <DialogContent dividers>
                    <Typography sx={{ mb: 1 }}>
                        Please enter a reason for rejecting this leave request:
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        value={rejectionRemark}
                        onChange={(e) => setRejectionRemark(e.target.value)}
                        placeholder="Enter rejection remark..."
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRejectDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleRejectSubmit}
                        variant="contained"
                        color="error"
                        disabled={!rejectionRemark.trim()}
                    >
                        Submit Rejection
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Leave;
