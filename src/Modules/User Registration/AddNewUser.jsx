import * as React from 'react';
import {
  Container, Typography, TextField, Button, Box, Dialog,
  DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem
} from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import { setOfficeId } from "../../Redux/userSlice.js";
import { getAllEmployees } from '../../Services/EmployeeService.js';

const AddNewUser = () => {
  const dispatch = useDispatch();
  const officeId = useSelector((state) => state.user.officeId);

  const [dialogOpen, setDialogOpen] = React.useState(false); // 🆕 Controls dialog open/close
  const [employeeCode, setEmployeeCode] = React.useState('');
  const [employeeName, setEmployeeName] = React.useState('');
  const [role, setRole] = React.useState('');
  const [selectedUserType, setSelectedUserType] = React.useState('');
  const [employee, setAllEmployees] = React.useState([]);

  React.useEffect(() => {
    const fetchData = async () => {
      if (!officeId) return;
      const data = await getAllEmployees(officeId);
      setAllEmployees(data);
    };
    fetchData();
  }, [officeId]);

  const handleDialogOpen = () => setDialogOpen(true);
  const handleDialogClose = () => setDialogOpen(false);

  return (
    <Container maxWidth={false}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" gutterBottom>Add User</Typography>
        <Button variant="contained" onClick={handleDialogOpen}>
          Add Employee
        </Button>
      </Box>

      {/* 🧩 Dialog for Add Employee */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>Add New Employee</DialogTitle>
        <DialogContent dividers>
          <FormControl fullWidth margin="dense" size="small">
            <InputLabel>Select Employee Code*</InputLabel>
            <Select
              value={employeeCode}
              label="Select Employee Code *"
              onChange={(event) => setEmployeeCode(event.target.value)}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {employee.map((emp) => (
                <MenuItem key={emp.employeeCode} value={emp.employeeCode}>
                  {emp.employeeCode}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="dense" size="small">
            <InputLabel>Select Employee Name*</InputLabel>
            <Select
              value={employeeName}
              label="Select Employee Name *"
              onChange={(event) => setEmployeeName(event.target.value)}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {employee.map((emp) => (
                <MenuItem key={emp.employeeName} value={emp.employeeName}>
                  {emp.employeeName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="dense" size="small">
            <InputLabel>Select Role*</InputLabel>
            <Select
              value={role}
              label="Select Role *"
              onChange={(event) => setRole(event.target.value)}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {employee.map((emp) => (
                <MenuItem key={emp.roleId} value={emp.roleId}>
                  {emp.roleId}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="dense" size="small">
            <InputLabel>Select User Type*</InputLabel>
            <Select
              value={selectedUserType}
              label="Select User Type *"
              onChange={(event) => setSelectedUserType(event.target.value)}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {employee.map((emp) => (
                <MenuItem key={emp.officeId} value={emp.officeId}>
                  {emp.officeName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            // Save logic here
            console.log({ employeeCode, employeeName, role, selectedUserType });
            handleDialogClose();
          }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AddNewUser;
