import React, { useEffect, useState } from "react";
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
    MenuItem,
    Select,
    FormControl,
    InputLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSelector } from "react-redux";

import {
    getLeaveBalancesByOffice,
    createLeaveBalance,
    updateLeaveBalance,
    deleteLeaveBalance
} from "../../Services/LeaveBalance";
import { getAllEmployees } from "../../Services/EmployeeService";
import { getAllLeaveTypes } from "../../Services/LeaveMasterService";

const LeaveBalancePage = () => {
    const [records, setRecords] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [open, setOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const officeId = useSelector((state) => state.user.officeId);

    const [formData, setFormData] = useState({
        id: 0,
        officeId: officeId,
        employeeId: "",
        leaveTypeId: "",
        balance: "",
        financialYear: "",
        isActive: true,
    });

    // Load all records + dropdown data
    const fetchData = async () => {
        try {
            if (!officeId) return;

            const [leaveData, empData, typeData] = await Promise.all([
                getLeaveBalancesByOffice(officeId),
                getAllEmployees(officeId),
                getAllLeaveTypes(officeId),
            ]);

            setRecords(leaveData);
            setEmployees(empData);
            setLeaveTypes(typeData);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, [officeId]);

    // Handle input
    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    // Open dialog for new/edit
    const handleOpen = (record = null) => {
        if (record) {
            setEditingRecord(record);
            setFormData(record);
        } else {
            setEditingRecord(null);
            setFormData({
                id: 0,
                officeId: officeId,
                employeeId: "",
                leaveTypeId: "",
                balance: "",
                financialYear: "",
                isActive: true,
            });
        }
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    // Save record
    const handleSave = async () => {
        try {
            if (editingRecord) {
                await updateLeaveBalance(formData.id, formData);
            } else {
                await createLeaveBalance(formData);
            }
            fetchData();
            handleClose();
        } catch (err) {
            console.error(err);
        }
    };

    // Delete record
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this record?")) {
            try {
                await deleteLeaveBalance(id);
                fetchData();
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h4">Employee Leave</Typography>
                <Box display="flex" alignItems="center" gap={2}>
                    {/* <TextField
                        placeholder="Search by Employee Name, Leave Type"
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
                                    data={filteredShift}
                                    filename="Shifts.csv"
                                    headers={csvHeaders}
                                /> */}
                    <Button variant="contained" color="primary" onClick={() => handleOpen()}>
                        Add Employee Leave
                    </Button>
                </Box>
            </Box>

            <Paper sx={{ mt: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Employee</TableCell>
                            <TableCell>Leave Type</TableCell>
                            <TableCell>Balance</TableCell>
                            <TableCell>Financial Year</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {records.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell>
                                    {employees.find((e) => e.employeeId === row.employeeId)?.employeeName || row.employeeId}
                                </TableCell>
                                <TableCell>
                                    {leaveTypes.find((t) => t.id === row.leaveTypeId)?.leaveType || row.leaveTypeId}
                                </TableCell>
                                <TableCell>{row.balance}</TableCell>
                                <TableCell>{row.financialYear}</TableCell>
                                <TableCell>
                                    <IconButton color="primary" onClick={() => handleOpen(row)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        onClick={() => handleDelete(row.id)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>

            {/* Dialog Form */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>
                    {editingRecord ? "Edit Leave Balance" : "Add Leave Balance"}
                </DialogTitle>
                <DialogContent
                    sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 400 }}
                >

                    {/* Employee Dropdown */}
                    <FormControl>
                        <InputLabel>Employee</InputLabel>
                        <Select
                            name="employeeId"
                            value={formData.employeeId}
                            onChange={handleChange}
                        >
                            {employees.map((emp) => (
                                <MenuItem key={emp.employeeId} value={emp.employeeId}>
                                    {emp.employeeName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Leave Type Dropdown */}
                    <FormControl>
                        <InputLabel>Leave Type</InputLabel>
                        <Select
                            name="leaveTypeId"
                            value={formData.leaveTypeId}
                            onChange={handleChange}
                        >
                            {leaveTypes.map((type) => (
                                <MenuItem key={type.id} value={type.id}>
                                    {type.leaveType}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        label="Balance"
                        name="balance"
                        value={formData.balance}
                        onChange={handleChange}
                    />
                    <TextField
                        label="Financial Year"
                        name="financialYear"
                        value={formData.financialYear}
                        onChange={handleChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default LeaveBalancePage;