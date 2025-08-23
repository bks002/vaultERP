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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useSelector } from "react-redux";
import { fetchLeaves, approveLeave, rejectLeave } from "../../Services/LeaveService";
import ExportCSVButton from "../../Components/Export to CSV/ExportCSVButton";

const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-IN");

const Leave = () => {
    const officeId = useSelector((state) => state.user.officeId);
    const [leaveData, setLeaveData] = useState([]);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [rejectionRemark, setRejectionRemark] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const loadLeaves = async () => {
            try {
                const data = await fetchLeaves(officeId);
                setLeaveData(data);
            } catch (err) {
                console.error("Error loading leaves:", err.message);
            }
        };
        loadLeaves();
    }, [officeId]);

    const handleApprove = async (index) => {
        const leave = leaveData[index];
        try {
            await approveLeave(leave.leaveId);

            const updated = leaveData.map((item, i) =>
               i === index ? { ...item, status: "Approved", rejectionRemarks: null } : item
            );

            setLeaveData(updated);
        } catch (err) {
            console.error("Approval failed:", err.message);
        }
    };

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
                    ? { ...item, status: "Rejected", rejectionRemarks: rejectionRemark }
                    : item
            );

            setLeaveData(updated);
            setRejectDialogOpen(false);
        } catch (err) {
            console.error("Rejection failed:", err.message);
        }
    };

    const filteredData = leaveData.filter((leave) =>
        leave.employeeName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const csvHeaders = [
        { label: "Employee Name", key: "employeeName" },
        { label: "From Date", key: "fromDate" },
        { label: "To Date", key: "toDate" },
        { label: "Leave Type", key: "leaveType" },
        { label: "Reason", key: "reason" },
        { label: "Status", key: "status" },
        { label: "Rejection Remarks", key: "rejectionRemarks" }, // updated key
    ];

    const csvData = filteredData.map((row) => ({
        ...row,
        fromDate: formatDate(row.fromDate),
        toDate: formatDate(row.toDate),
    }));

    return (
        <Container maxWidth={false}>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
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
                </Box>
            </Box>

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
                            <TableCell>{row.rejectionRemarks || "-"}</TableCell>
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
                    <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
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
