import React, { useEffect, useState } from 'react';
import {
    Container, Typography, Button, TextField, Dialog,
    DialogTitle, DialogContent, DialogActions, Box,
    IconButton, Tooltip, Table, TableHead, TableRow,
    TableCell, TableBody, Stack, TableContainer, Paper, MenuItem, InputAdornment,
} from '@mui/material';
import {
    getAllEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
} from "../../Services/EmployeeService";
import { getAllOperation, OperationMapping, getOperationbyEmployee } from "../../Services/OperationService";
import AlertSnackbar from "../../Components/Alert/AlertSnackBar";
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SettingsIcon from '@mui/icons-material/Settings';
import { useSelector } from "react-redux";
import Checkbox from '@mui/material/Checkbox';
import {employmentTypes, department, gender} from "../../Components/constant";

const EmployeeMasterPage = () => {
    const officeId = useSelector((state) => state.user.officeId);
    const officeName= useSelector((state)=> state.user.officeName);
     const [searchQuery, setSearchQuery] = useState('');
    const userId = useSelector((state) => state.user.userId);
    const [employees, setEmployees] = useState([]);
    const [operations, setOperations] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [settingOpen, setSettingOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    const [selectedEmployee, setSelectedEmployee] = useState({
        employeeId: '',
        employementType: 'Permanent',
        employeeName: '',
        email: '',
        phoneNumber: '',
        designation: '',
        roleId: 10,
        department: '',
        officeId: '',
        employeeCode: '',
        Image: '',
        dob: '',
        pancard: '',
        aadharcard: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        gender: '',
        operationIds: [
            {
                operationId: '',
            }
        ]
    });

    const [alert, setAlert] = useState({ open: false, type: 'success', message: '' });

    useEffect(() => {
        if (officeId) {
            loadEmployees();
            loadOperations();
        }
    }, [officeId]);

    const loadEmployees = async () => {
        try {
            const data = await getAllEmployees(officeId);
            setEmployees(data);
        } catch {
            showAlert('error', 'Failed to load employee list');
        }
    };

    const loadOperations = async () => {
        try {
            const data = await getAllOperation(officeId);
            setOperations(data);
        } catch {
            showAlert('error', 'Failed to load operations');
        }
    };

    const showAlert = (type, message) => {
        setAlert({ open: true, type, message });
    };

    const handleCreate = () => {
        setIsEdit(false);
        setSelectedEmployee({
            employeeName: '',
            employementType: 'Permanent',
            email: '',
            phoneNumber: '',
            designation: '',
            roleId: 9,
            department: '',
            officeId: officeId ,
            employeeCode: '',
            dob: '',
            pancard: '',
            aadharcard: '',
            address1: '',
            address2: '',
            city: '',
            state: '',
            gender: '',
        });
        setDialogOpen(true);
    };

    const handleEdit = (emp) => {
        setSelectedEmployee({ ...emp });
        setIsEdit(true);
        setDialogOpen(true);
    };

    const handleView = (emp) => {
        setSelectedEmployee({ ...emp });
        setViewOpen(true);
    };

    const handleDelete = async (emp) => {
        if (window.confirm(`Are you sure you want to delete "${emp.employeeName}"?`)) {
            try {
                await deleteEmployee(emp.employeeId);
                showAlert('success', 'Employee deleted successfully');
                loadEmployees();
            } catch {
                showAlert('error', 'Failed to delete employee');
            }
        }
    };

    const handleSettings = async (emp) => {
        try {
            setSelectedEmployee({ ...emp });
            const mappedOps = await getOperationbyEmployee(emp.employeeId);
            const ids = mappedOps.map(op => (typeof op === "object" ? op.operationId : op));
            setSelectedIds(ids);
            setSettingOpen(true);
        } catch (err) {
            showAlert("error", "Failed to load mapped operations");
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSelectedEmployee({ ...selectedEmployee, [name]: value });
    };

    // const handleFileChange = async (e) => {
    //     const file = e.target.files[0];
    //     if (!file) return;

    //     const formData = new FormData();
    //     formData.append("file", file);
    //     console.log("Uploading file:", file);
    //     console.log("Uploading file:", formData);

    //     try {
    //         const response = await axios.post(
    //             "https://admin.urest.in:8089/api/ImageUpload/upload",
    //             file,
    //             {
    //                 headers: {
    //                     "Content-Type": "multipart/form-data",
    //                 },
    //             }
    //         );

    //         if (response.status === 200 && response.data.url) {
    //             setSelectedEmployee((prev) => ({
    //                 ...prev,
    //                 profileImageUrl: response.data.url,
    //             }));
    //             showAlert("success", "Image uploaded successfully");
    //         } else {
    //             showAlert("error", "Image upload failed");
    //         }
    //     } catch (error) {
    //         console.error("Upload Error:", error);
    //         showAlert("error", "Error uploading image");
    //     }
    // };

    const handleCheckboxChange = (employeeId) => {
        setSelectedIds((prev) =>
            prev.includes(employeeId)
                ? prev.filter((id) => id !== employeeId)
                : [...prev, employeeId]
        );
    };

    const handleSave = async () => {
        const payload = {
            ...selectedEmployee,
            officeId: parseInt(officeId),
            roleId: parseInt(selectedEmployee.roleId || 0),
            createdBy: userId,
            isActive: true
        };

        try {
            if (isEdit) {
                await updateEmployee(selectedEmployee.employeeId, payload);
                showAlert('success', 'Employee updated successfully');
            } else {
                await createEmployee(payload);
                console.log(payload);
                showAlert('success', 'Employee created successfully');
            }

            setDialogOpen(false);
            loadEmployees();
        } catch {
            showAlert('error', 'Failed to save employee');
        }
    };

    const handleSaveSettings = async () => {
        try {
            const payload = {
                employeeId: selectedEmployee.employeeId,
                operationIds: selectedIds,
                updatedBy: userId
            };

            await OperationMapping(payload);
            showAlert("success", "Employee operations mapped successfully");
            setSettingOpen(false);
            loadEmployees();
        } catch (error) {
            showAlert("error", error.message || "Failed to map operations");
        }
    };
      const filteredEmployee = employees.filter((rate) =>
        rate.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         rate.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return (
        <Container maxWidth={false}>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h4">Employee Master</Typography>
                <Box display="flex" alignItems="center" gap={2}>
                    <TextField
                        placeholder="Search by Employee Name, Email"
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
                <Button variant="contained" onClick={handleCreate}>Add Employee</Button>
            </Box>
            </Box>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Employee Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Phone</TableCell>
                        <TableCell>Designation</TableCell>
                        <TableCell align="center">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredEmployee.length > 0 ? (
                        filteredEmployee.map((emp, index) => (
                            <TableRow key={emp.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{emp.employeeName}</TableCell>
                                <TableCell>{emp.email}</TableCell>
                                <TableCell>{emp.phoneNumber}</TableCell>
                                <TableCell>{emp.designation}</TableCell>
                                <TableCell align="center">
                                    <Tooltip title="View">
                                        <IconButton onClick={() => handleView(emp)} color="info">
                                            <VisibilityIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Edit">
                                        <IconButton onClick={() => handleEdit(emp)} color="primary">
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                        <IconButton onClick={() => handleDelete(emp)} color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Operations">
                                        <IconButton onClick={() => handleSettings(emp)} color="default">
                                            <SettingsIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} align="center">No employees found</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>{isEdit ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField label="Office Name" name="officeName" value={officeName}  fullWidth />
                        <TextField label="Employee Code" name="employeeCode" value={selectedEmployee.employeeCode} onChange={handleChange} fullWidth />
                        <TextField label="Employee Name" name="employeeName" value={selectedEmployee.employeeName} onChange={handleChange} fullWidth />
                        <TextField select label="Employment Type" name="employementType" value={selectedEmployee.employementType } onChange={handleChange} fullWidth >
                            {employmentTypes.map((type) => (
                                <MenuItem key={type} value={type}>
                                    {type}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField label="Email" name="email" value={selectedEmployee.email} onChange={handleChange} fullWidth />
                        <TextField label="Phone Number" name="phoneNumber" value={selectedEmployee.phoneNumber} onChange={handleChange} fullWidth />
                        <TextField label="Designation" name="designation" value={selectedEmployee.designation} onChange={handleChange} fullWidth />
                        <TextField select label="Department" name="department" value={selectedEmployee.department} onChange={handleChange} fullWidth >
                            {department.map((type) => (
                                <MenuItem key={type} value={type}>
                                    {type}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField select label="Gender" name="gender" value={selectedEmployee.gender} onChange={handleChange} fullWidth >
                            {gender.map((type) => (
                                <MenuItem key={type} value={type}>
                                    {type}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField label="Date of Birth" name="dob" type="date" value={selectedEmployee.dob } onChange={handleChange} fullWidth InputLabelProps={{ shrink: true,}} />
                        <TextField label="Pan Card" name="pancard" value={selectedEmployee.pancard} onChange={handleChange} fullWidth />
                        <TextField label="Aadhar Card" name="aadharcard" value={selectedEmployee.aadharcard} onChange={handleChange} fullWidth />
                        <TextField label="Address Line 1" name="address1" value={selectedEmployee.address1} onChange={handleChange} fullWidth />
                        <TextField label="Address Line 2" name="address2" value={selectedEmployee.address2} onChange={handleChange} fullWidth />
                        <TextField label="City" name="city" value={selectedEmployee.city} onChange={handleChange} fullWidth />
                        <TextField label="State" name="state" value={selectedEmployee.state} onChange={handleChange} fullWidth />
                        {/* <TextField type="file" name="image" onChange={handleFileChange} fullWidth InputLabelProps={{ shrink: true }} /> */}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>{isEdit ? 'Update' : 'Save'}</Button>
                </DialogActions>
            </Dialog>

            {/* View Dialog */}
            <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>View Employee</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField label="Office Name" value={officeName} fullWidth disabled />
                        <TextField label="Employee Code" value={selectedEmployee.employeeCode} fullWidth disabled />
                        <TextField label="Employee Name" value={selectedEmployee.employeeName} fullWidth disabled />
                        <TextField label="Employement Type" value={selectedEmployee.employementType} fullWidth disabled />
                        <TextField label="Email" value={selectedEmployee.email} fullWidth disabled />
                        <TextField label="Phone Number" value={selectedEmployee.phoneNumber} fullWidth disabled />
                        <TextField label="Designation" value={selectedEmployee.designation} fullWidth disabled />
                        <TextField label="Department" value={selectedEmployee.department} fullWidth disabled />
                        <TextField label="Gender" value={selectedEmployee.gender} fullWidth disabled />
                        <TextField label="Date of Birth" value={selectedEmployee.dob} fullWidth disabled />
                        <TextField label="Pan Card" value={selectedEmployee.pancard} fullWidth disabled/>
                        <TextField label="Aadhar Card" value={selectedEmployee.aadharcard} fullWidth disabled/>
                        <TextField label="Address Line 1" value={selectedEmployee.address1} fullWidth disabled/>
                        <TextField label="Address Line 2" value={selectedEmployee.address2} fullWidth disabled/>
                        <TextField label="City" value={selectedEmployee.city} fullWidth disabled/>
                        <TextField label="State" value={selectedEmployee.state} fullWidth disabled/>
                        {/* <TextField label="Image" value={selectedEmployee.Image} fullWidth disabled /> */}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={settingOpen} onClose={() => setSettingOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Operation Employee</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField label="Employee Name" value={selectedEmployee.employeeName} fullWidth />
                        <TextField label="Employee Code" value={selectedEmployee.employeeCode} fullWidth />
                    </Stack>
                    <TableContainer component={Paper} sx={{ mt: 3 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell />
                                    <TableCell>Operation Name</TableCell>
                                    <TableCell>Description</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {operations.map((op) => (
                                    <TableRow key={op.operationId}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedIds.includes(op.operationId)}
                                                onChange={() => handleCheckboxChange(op.operationId)}
                                            />
                                        </TableCell>
                                        <TableCell>{op.operationName}</TableCell>
                                        <TableCell>{op.description}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSettingOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveSettings}>Save</Button>
                </DialogActions>
            </Dialog>

            <AlertSnackbar
                open={alert.open}
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert({ ...alert, open: false })}
            />
        </Container>
    );
};

export default EmployeeMasterPage;
