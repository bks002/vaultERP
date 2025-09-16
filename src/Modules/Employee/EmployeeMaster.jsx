import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Button, TextField, Dialog,
  DialogTitle, DialogContent, DialogActions, Box,
  IconButton, Tooltip, Table, TableHead, TableRow,
  TableCell, TableBody, Stack, TableContainer, Paper, MenuItem, InputAdornment, Grid, FormControlLabel
} from '@mui/material';
import { Add, Delete } from "@mui/icons-material";

import {
  getAllEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../../Services/EmployeeService";
import { Tabs, Tab } from "@mui/material";
import { getAllOperation, OperationMapping, getOperationbyEmployee } from "../../Services/OperationService";
import AlertSnackbar from "../../Components/Alert/AlertSnackBar";
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SettingsIcon from '@mui/icons-material/Settings';
import { useSelector } from "react-redux";
import Checkbox from '@mui/material/Checkbox';
import { employmentTypes, department, gender } from "../../Components/constant";
import ExportCSVButton from '../../Components/Export to CSV/ExportCSVButton';
//import { uploadImage } from '../../Services/ImageService';
import LockResetIcon from '@mui/icons-material/LockReset';
import { resetEmployeePassword } from "../../Services/EmployeeService";


const EmployeeMasterPage = () => {
  const officeId = useSelector((state) => state.user.officeId);
  const officeName = useSelector((state) => state.user.officeName);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const userId = useSelector((state) => state.user.userId);
  const [employees, setEmployees] = useState([]);
  const [operations, setOperations] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [settingOpen, setSettingOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  // const [selectedFile, setSelectedFile] = useState(null);
  //const [viewStep, setViewStep] = useState(0);

  const [selectedEmployee, setSelectedEmployee] = useState({
    employeeId: '',
    employmentType: 'Permanent',
    employeeName: '',
    email: '',
    phoneNumber: '',
    designation: '',
    roleId: 10,
    department: '',
    officeId: '',
    employeeCode: '',
    Image: '',
    dateOfBirth: '',
    panCard: '',
    aadharCard: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    gender: '',
    operationIds: [
      {
        operationId: '',
      }
    ],
    WorkHistory: [{ companyName: '', role: '', startDate: '', endDate: '', dateOfJoining: null, relievingDate: null, thirdPartyVerification: false, resumeFile: null }],
    bankDetails: [{ bankName: '', uaN_No: '', bankAccNo: '', ifsC_Code: '', paN_No: '' }],

  });
  const defaultEmployee = {
    employeeId: '',
    employmentType: 'Permanent',
    employeeName: '',
    email: '',
    phoneNumber: '',
    designation: '',
    roleId: 10,
    department: '',
    officeId: '',
    employeeCode: '',
    Image: '',
    dateOfBirth: '',
    panCard: '',
    aadharCard: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    gender: '',
    operationIds: [{ operationId: '' }],
    WorkHistory: [{ companyName: '', role: '', startDate: '', endDate: '', dateOfJoining: null, relievingDate: null, thirdPartyVerification: false, resumeFile: null }],
    bankDetails: [{ bankName: '', uaN_No: '', bankAccNo: '', ifsC_Code: '', paN_No: '' }],
  };


  const [alert, setAlert] = useState({ open: false, type: 'success', message: '' });

  useEffect(() => {
    if (officeId) {
      loadEmployees();
      loadOperations();
    }
  }, [officeId]);

  const handleStepChange = (event, newValue) => {
    setActiveStep(newValue);
  };


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
      employmentType: 'Permanent',
      email: '',
      phoneNumber: '',
      designation: '',
      roleId: 9,
      department: '',
      officeId: officeId,
      employeeCode: '',
      dateOfBirth: '',
      panCard: '',
      aadharCard: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      gender: '',
      WorkHistory: [{ companyName: '', role: '', startDate: '', endDate: '', dateOfJoining: null, relievingDate: null, thirdPartyVerification: false, resumeFile: null }],
      bankDetails: [{ bankName: '', uaN_No: '', bankAccNo: '', ifsC_Code: '', paN_No: '' }],
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

  //  const handleFileChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     setSelectedFile(file);
  //   }
  // };


  //     const handleImageUpload = async () => {
  //         if (!selectedFile) {
  //             showAlert("error", "Please select a file first");
  //             return;
  //         }

  //         try {
  //             const result = await uploadImage(selectedFile);
  //             if (result && result.url) {
  //                 setSelectedEmployee((prev) => ({
  //                     ...prev,
  //                     Image: result.url,
  //                 }));
  //                 showAlert("success", "Image uploaded successfully");
  //             } else {
  //                 showAlert("error", "Image upload failed: No URL returned");
  //             }
  //         } catch (error) {
  //             showAlert("error", "Image upload failed");
  //         }
  //     };

  const handleCheckboxChange = (employeeId) => {
    setSelectedIds((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  // Add new work history entry
  // Add new work history entry
  const addWorkHistory = () => {
    setSelectedEmployee((prev) => ({
      ...prev,
      WorkHistory: [
        ...(prev.WorkHistory || []),
        { companyName: "", role: "", startDate: "", endDate: "" },
      ],
    }));
  };

  // Handle change in work history
  const handleWorkHistoryChange = (index, field, value) => {
    setSelectedEmployee((prev) => {
      const updated = [...(prev.WorkHistory || [])];
      updated[index][field] = value;
      return { ...prev, WorkHistory: updated };
    });
  };

  // Delete a work history entry
  const deleteWorkHistory = (index) => {
    setSelectedEmployee((prev) => {
      const updated = [...(prev.WorkHistory || [])];
      updated.splice(index, 1);
      return { ...prev, WorkHistory: updated };
    });
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();

      // Append primitive fields (skip null/undefined/empty)
      Object.keys(selectedEmployee).forEach((key) => {
        if (
          selectedEmployee[key] !== undefined &&
          selectedEmployee[key] !== null &&
          selectedEmployee[key] !== "" &&
          key !== "bankDetails" &&
          key !== "WorkHistory"
        ) {
          formData.append(key, selectedEmployee[key]);
        }
      });

      // Append Bank Details (array of objects)
      if (selectedEmployee.bankDetails?.length) {
        selectedEmployee.bankDetails.forEach((bank, index) => {
          Object.keys(bank).forEach((field) => {
            if (bank[field] !== undefined && bank[field] !== null && bank[field] !== "") {
              formData.append(`bankDetails[${index}][${field}]`, bank[field]);
            }
          });
        });
      }

      // Append Work History (array of objects)
      if (selectedEmployee.WorkHistory?.length) {
        selectedEmployee.WorkHistory.forEach((work, index) => {
          Object.keys(work).forEach((field) => {
            if (work[field] !== undefined && work[field] !== null && work[field] !== "") {
              formData.append(`WorkHistory[${index}][${field}]`, work[field]);
            }
          });
        });
      }

      // Decide between Create or Update
      if (selectedEmployee.id) {
        await updateEmployee(selectedEmployee.id, formData);
      } else {
        await createEmployee(formData);
      }

      loadEmployees(officeId);
      setDialogOpen(false);
      setSelectedEmployee(defaultEmployee);
    } catch (error) {
      console.error("Error saving employee:", error);
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

  const handleChangePassword = (emp) => {
    setSelectedEmployee({ ...emp });
    setPasswordDialogOpen(true);
  };
  const filteredEmployee = employees.filter((rate) =>
    rate.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rate.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const csvHeaders = [
    { label: "Employee Code", key: "employeeCode" },
    { label: "Name", key: "employeeName" },
    { label: "Email", key: "email" },
    { label: "Phone", key: "phoneNumber" },
    { label: "Designation", key: "designation" },
    { label: "Department", key: "department" },
    { label: "DOB", key: "dateOfBirth" },
    { label: "Gender", key: "gender" }
  ];

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
          <ExportCSVButton
            data={filteredEmployee}
            filename={`EmployeeMaster.csv`}
            headers={csvHeaders}
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
                  <Tooltip title="Change Password">
                    <IconButton onClick={() => handleChangePassword(emp)} color="warning">
                      <LockResetIcon />
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

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mt: 1 }}>
            Do you want to change the password?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>No</Button>
          <Button variant="contained" onClick={async () => {
            try {
              await resetEmployeePassword(selectedEmployee.email);
              showAlert('success', 'Password changed successfully');
            } catch (error) {
              showAlert('error', 'Failed to change password');
            }
            setPasswordDialogOpen(false);
          }}>Yes</Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{isEdit ? 'Edit Employee' : 'Add Employee'}</DialogTitle>

        {/* Tabs for Navigation */}
        <Tabs value={activeStep} onChange={handleStepChange} centered>
          <Tab label="Personal Details" />
          <Tab label="Bank Details" />
          <Tab label="Work History" />
        </Tabs>

        <DialogContent>
          {activeStep === 0 && (
            <Stack spacing={2} mt={2}>
              {/* === Personal Details Form === */}
              <TextField label="Office Name" name="officeName" value={officeName} fullWidth disabled />
              <TextField label="Employee Code" name="employeeCode" value={selectedEmployee.employeeCode} onChange={handleChange} fullWidth />
              <TextField label="Employee Name" name="employeeName" value={selectedEmployee.employeeName} onChange={handleChange} fullWidth />
              <TextField select label="Employment Type" name="employmentType" value={selectedEmployee.employmentType} onChange={handleChange} fullWidth>
                {employmentTypes.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </TextField>
              <TextField label="Email" name="email" value={selectedEmployee.email} onChange={handleChange} fullWidth />
              <TextField label="Phone Number" name="phoneNumber" value={selectedEmployee.phoneNumber} onChange={handleChange} fullWidth />
              <TextField label="Designation" name="designation" value={selectedEmployee.designation} onChange={handleChange} fullWidth />
              <TextField select label="Department" name="department" value={selectedEmployee.department} onChange={handleChange} fullWidth>
                {department.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </TextField>
              <TextField select label="Gender" name="gender" value={selectedEmployee.gender} onChange={handleChange} fullWidth>
                {gender.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </TextField>
              <TextField label="Date of Birth" name="dateOfBirth" type="date" value={selectedEmployee.dateOfBirth} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
              <TextField label="Pan Card" name="panCard" value={selectedEmployee.panCard} onChange={handleChange} fullWidth />
              <TextField label="Aadhar Card" name="aadharCard" value={selectedEmployee.aadharCard} onChange={handleChange} fullWidth />
              <TextField label="Address Line 1" name="address1" value={selectedEmployee.address1} onChange={handleChange} fullWidth />
              <TextField label="Address Line 2" name="address2" value={selectedEmployee.address2} onChange={handleChange} fullWidth />
              <TextField label="City" name="city" value={selectedEmployee.city} onChange={handleChange} fullWidth />
              <TextField label="State" name="state" value={selectedEmployee.state} onChange={handleChange} fullWidth />
            </Stack>
          )}

          {/* ===== Bank Details Tab ===== */}
          {activeStep === 1 && (
            <Stack spacing={2} mt={2}>
              <TextField
                label="Bank Account Number"
                value={selectedEmployee.bankDetails?.[0]?.bankAccNo || ""}
                fullWidth
                onChange={(e) => {
                  const updatedBank = [...selectedEmployee.bankDetails];
                  updatedBank[0] = { ...updatedBank[0], bankAccNo: e.target.value };
                  setSelectedEmployee({ ...selectedEmployee, bankDetails: updatedBank });
                }}
              />
              <TextField
                label="Bank IFSC Code"
                value={selectedEmployee.bankDetails?.[0]?.ifsC_Code || ""}
                fullWidth
                onChange={(e) => {
                  const updatedBank = [...selectedEmployee.bankDetails];
                  updatedBank[0] = { ...updatedBank[0], ifsC_Code: e.target.value };
                  setSelectedEmployee({ ...selectedEmployee, bankDetails: updatedBank });
                }}
              />
              <TextField
                label="Bank Name"
                value={selectedEmployee.bankDetails?.[0]?.bankName || ""}
                fullWidth
                onChange={(e) => {
                  const updatedBank = [...selectedEmployee.bankDetails];
                  updatedBank[0] = { ...updatedBank[0], bankName: e.target.value };
                  setSelectedEmployee({ ...selectedEmployee, bankDetails: updatedBank });
                }}
              />
              <TextField
                label="UAN Number"
                value={selectedEmployee.bankDetails?.[0]?.uaN_No || ""}
                fullWidth
                onChange={(e) => {
                  const updatedBank = [...selectedEmployee.bankDetails];
                  updatedBank[0] = { ...updatedBank[0], uaN_No: e.target.value };
                  setSelectedEmployee({ ...selectedEmployee, bankDetails: updatedBank });
                }}
              />
              <TextField
                label="PAN Number"
                value={selectedEmployee.bankDetails?.[0]?.paN_No || ""}
                fullWidth
                onChange={(e) => {
                  const updatedBank = [...selectedEmployee.bankDetails];
                  updatedBank[0] = { ...updatedBank[0], paN_No: e.target.value };
                  setSelectedEmployee({ ...selectedEmployee, bankDetails: updatedBank });
                }}
              />
            </Stack>
          )}

          {/* ===== Work History Tab ===== */}
          {activeStep === 2 && (
            <Stack spacing={2} mt={2}>
              {/* Work History (Multiple Entries) */}
              {selectedEmployee.WorkHistory?.map((wh, index) => (
                <Box
                  key={index}
                  sx={{
                    border: "1px solid #ccc",
                    borderRadius: 2,
                    p: 2,
                    mb: 3, // gap between boxes
                    position: "relative",
                  }}
                >
                  {/* Delete Button (top-right) */}
                  <IconButton
                    sx={{ position: "absolute", top: 8, right: 8 }}
                    color="error"
                    onClick={() => deleteWorkHistory(index)}
                  >
                    <Delete />
                  </IconButton>

                  {/* Company Name */}
                  <TextField
                    label="Company Name"
                    value={wh.companyName}
                    fullWidth
                    onChange={(e) => handleWorkHistoryChange(index, "companyName", e.target.value)}
                    sx={{ mb: 2 }}
                  />

                  {/* Role */}
                  <TextField
                    label="Role"
                    value={wh.role}
                    fullWidth
                    onChange={(e) => handleWorkHistoryChange(index, "role", e.target.value)}
                    sx={{ mb: 2 }}
                  />

                  {/* Start & End Date */}
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        type="date"
                        label="Start Date"
                        InputLabelProps={{ shrink: true }}
                        value={wh.startDate}
                        fullWidth
                        onChange={(e) => handleWorkHistoryChange(index, "startDate", e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        type="date"
                        label="End Date"
                        InputLabelProps={{ shrink: true }}
                        value={wh.endDate}
                        fullWidth
                        onChange={(e) => handleWorkHistoryChange(index, "endDate", e.target.value)}
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}

              {/* Add Work History Button */}
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={addWorkHistory}
              >
                Add Work History
              </Button>

              {/* Date of Joining & Relieving Date */}
              <Grid container spacing={2} sx={{ mt: 3 }}>
                <Grid item xs={6}>
                  <TextField
                    type="date"
                    label="Date of Joining"
                    InputLabelProps={{ shrink: true }}
                    value={selectedEmployee.dateOfJoining || ""}
                    fullWidth
                    onChange={(e) =>
                      setSelectedEmployee((prev) => ({
                        ...prev,
                        dateOfJoining: e.target.value,
                      }))
                    }
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    type="date"
                    label="Relieving Date"
                    InputLabelProps={{ shrink: true }}
                    value={selectedEmployee.relievingDate || ""}
                    fullWidth
                    onChange={(e) =>
                      setSelectedEmployee((prev) => ({
                        ...prev,
                        relievingDate: e.target.value,
                      }))
                    }
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    sx={{ mt: 2 }}
                    control={
                      <Checkbox
                        checked={selectedEmployee.thirdPartyVerification || false}
                        onChange={(e) =>
                          setSelectedEmployee((prev) => ({
                            ...prev,
                            thirdPartyVerification: e.target.checked,
                          }))
                        }
                      />
                    }
                    label="Third-Party Verification"
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="outlined"
                  component="label"
                >
                  Upload Resume (PDF/DOC)
                  <input
                    type="file"
                    hidden
                    accept=".pdf,.doc,.docx"
                    onChange={(e) =>
                      setSelectedEmployee((prev) => ({
                        ...prev,
                        resumeFile: e.target.files[0],
                      }))
                    }
                  />
                </Button>
                {selectedEmployee.resumeFile && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Selected File: {selectedEmployee.resumeFile.name}
                  </Typography>
                )}
              </Box>
              {/* Third-Party Verification */}

            </Stack>
          )}
        </DialogContent>

        {/* Footer with Navigation */}
        <DialogActions>
          {activeStep > 0 && (
            <Button onClick={() => setActiveStep(activeStep - 1)}>Previous</Button>
          )}
          {activeStep < 2 && (
            <Button onClick={() => setActiveStep(activeStep + 1)}>Next</Button>
          )}
          {activeStep === 2 && (
            <Button variant="contained" onClick={handleSave}>{isEdit ? 'Update' : 'Save'}</Button>
          )}
        </DialogActions>
      </Dialog>


      {/* View Dialog */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>View Employee</DialogTitle>

        {/* Tabs */}
        <Tabs value={activeStep} onChange={handleStepChange} centered>
          <Tab label="Personal Details" />
          <Tab label="Bank Details" />
          <Tab label="Work History" />
        </Tabs>

        <DialogContent>
          {activeStep === 0 && (
            <Stack spacing={2} mt={2}>
              <TextField label="Office Name" value={officeName} fullWidth disabled />
              <TextField label="Employee Code" value={selectedEmployee.employeeCode} fullWidth disabled />
              <TextField label="Employee Name" value={selectedEmployee.employeeName} fullWidth disabled />
              <TextField label="Employement Type" value={selectedEmployee.employmentType} fullWidth disabled />
              <TextField label="Email" value={selectedEmployee.email} fullWidth disabled />
              <TextField label="Phone Number" value={selectedEmployee.phoneNumber} fullWidth disabled />
              <TextField label="Designation" value={selectedEmployee.designation} fullWidth disabled />
              <TextField label="Department" value={selectedEmployee.department} fullWidth disabled />
              <TextField label="Gender" value={selectedEmployee.gender} fullWidth disabled />
              <TextField label="Date of Birth" value={selectedEmployee.dateOfBirth} fullWidth disabled />
              <TextField label="Pan Card" value={selectedEmployee.panCard} fullWidth disabled />
              <TextField label="Aadhar Card" value={selectedEmployee.aadharCard} fullWidth disabled />
              <TextField label="Address Line 1" value={selectedEmployee.address1} fullWidth disabled />
              <TextField label="Address Line 2" value={selectedEmployee.address2} fullWidth disabled />
              <TextField label="City" value={selectedEmployee.city} fullWidth disabled />
              <TextField label="State" value={selectedEmployee.state} fullWidth disabled />
            </Stack>
          )}

          {activeStep === 1 && (
            <Stack spacing={2} mt={2}>
              <TextField label="Bank Account Number" value={selectedEmployee.bankAccountNumber || ""} fullWidth disabled />
              <TextField label="Bank IFSC Code" value={selectedEmployee.bankIfsc || ""} fullWidth disabled />
              <TextField label="Bank Name" value={selectedEmployee.bankName || ""} fullWidth disabled />
              <TextField label="UAN Number" value={selectedEmployee.uanNumber || ""} fullWidth disabled />
              <TextField label="PAN Number" value={selectedEmployee.panNumber || ""} fullWidth disabled />
            </Stack>
          )}


          {activeStep === 2 && (
            <Stack spacing={2} mt={2}>
              <TextField
                label="Date of Joining"
                value={selectedEmployee.dateOfJoining || ""}
                fullWidth
                disabled
              />
              <TextField
                label="Date of Leaving"
                value={selectedEmployee.dateOfLeaving || ""}
                fullWidth
                disabled
              />

              {/* Work History Loop */}
              {selectedEmployee.workHistories?.map((work, index) => (
                <Box
                  key={index}
                  sx={{ border: "1px solid #ccc", borderRadius: 2, p: 2, mb: 2 }}
                >
                  <TextField label="Company" value={work.company} fullWidth disabled sx={{ mb: 1 }} />
                  <TextField label="Role" value={work.role} fullWidth disabled sx={{ mb: 1 }} />
                  <TextField label="Start Date" value={work.startDate} fullWidth disabled sx={{ mb: 1 }} />
                  <TextField label="End Date" value={work.endDate} fullWidth disabled sx={{ mb: 1 }} />
                </Box>
              ))}

              {/* Resume */}
              {selectedEmployee.resume && (
                <Typography variant="body2">
                  Resume: {selectedEmployee.resume.name || selectedEmployee.resume}
                </Typography>
              )}

              {/* Third Party Verification */}
              <Typography variant="body2">
                Third Party Verification:{" "}
                {selectedEmployee.thirdPartyVerification ? "Yes" : "No"}
              </Typography>
            </Stack>
          )}

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
