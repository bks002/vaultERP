"use client"

import React, { useState, useEffect } from "react"
import {
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  OutlinedInput,
  Checkbox,
  ListItemText,
} from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"

import {
  fetchItemIssues,
  createItemIssue,
  deleteItemIssue,
  fetchInternalWorkOrders,
  fetchJobCardsByInternalWo,
  fetchOperationsByJobCard,
  fetchItemsByInternalWoid,
} from "../../Services/ItemIssueService"

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
}

const ItemPage = () => {
  const officeId = 1 // ✅ static for now (later dynamic from dashboard)
  const [rows, setRows] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [formData, setFormData] = useState({
    inwo: "",
    jobcardId: "",
    operation: "",
    employees: [],
    itemId: "",
    quantityIssued: "",
  })

  // Dropdown data
  const [inwoList, setInwoList] = useState([])
  const [jobCardList, setJobCardList] = useState([])
  const [operationList, setOperationList] = useState([])
  const [itemList, setItemList] = useState([])

  // ✅ Load all Item Issues initially
  useEffect(() => {
    const loadData = async () => {
      const data = await fetchItemIssues(officeId)
      setRows(data || [])
    }
    loadData()
  }, [])

  const handleEdit = (id) => {
    alert(`Edit row with ID: ${id}`)
  }

  const handleDelete = async (id) => {
    try {
      await deleteItemIssue(id)
      setRows(rows.filter((row) => row.id !== id))
    } catch (error) {
      console.error("Delete failed", error)
    }
  }

  // ✅ When "Create" is clicked → Load INWO list
  const handleCreate = async () => {
    setOpenDialog(true)
    try {
      const data = await fetchInternalWorkOrders(officeId)
      setInwoList(data || [])
    } catch (error) {
      console.error("Error fetching INWO list:", error)
    }
  }

  const handleClose = () => {
    setOpenDialog(false)
    setFormData({
      inwo: "",
      jobcardId: "",
      operation: "",
      employees: [],
      itemId: "",
      quantityIssued: "",
    })
    setJobCardList([])
    setOperationList([])
    setItemList([])
  }

  const handleSave = async () => {
    try {
      const newRow = await createItemIssue(formData)
      setRows([...rows, newRow])
      handleClose()
    } catch (error) {
      console.error("Save failed:", error)
    }
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // ✅ When INWO changes → fetch Items + JobCards
  const handleInwoChange = async (inwoId) => {
    handleChange("inwo", inwoId)

    // Items
    const items = await fetchItemsByInternalWoid(inwoId)
    setItemList(items.itemIds || [])

    // JobCards
    const jobCards = await fetchJobCardsByInternalWo(inwoId)
    setJobCardList(jobCards || [])

    // reset dependent dropdowns
    setOperationList([])
    handleChange("jobcardId", "")
    handleChange("operation", "")
  }

  // ✅ When JobCard changes → fetch Operations
  const handleJobCardChange = async (jobCardId) => {
  handleChange("jobcardId", jobCardId)

  try {
    if (jobCardId) {
      // ✅ Case 1: Job Card selected → fetch operations by JobCard
      const operations = await fetchOperationsByJobCard(jobCardId)
      setOperationList(operations || [])
    } else {
      // ✅ Case 2: No Job Card selected → fetch all operations by office
      const allOperations = await getAllOperation(selectedOfficeId) // <-- yahan aap apna officeId pass karo
      setOperationList(allOperations || [])
    }
  } catch (error) {
    console.error("Error fetching operations:", error)
    setOperationList([])
  }
}



  return (
    <div className="col-12">
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4">Item Issue</Typography>
        <Button variant="contained" color="primary" onClick={handleCreate}>
          Create Item Issue
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableRow>
            <TableCell><b>Item Id</b></TableCell>
            <TableCell><b>Quantity Issued</b></TableCell>
            <TableCell><b>INWO</b></TableCell>
            <TableCell><b>Jobcard ID</b></TableCell>
            <TableCell><b>Operation</b></TableCell>
            <TableCell><b>Employees</b></TableCell>
            <TableCell><b>Action</b></TableCell>
          </TableRow>

          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.itemId}</TableCell>
                <TableCell>{row.quantityIssued}</TableCell>
                <TableCell>{row.inwo}</TableCell>
                <TableCell>{row.jobcardId}</TableCell>
                <TableCell>{row.operation}</TableCell>
                <TableCell>{Array.isArray(row.employees) ? row.employees.join(", ") : row.employeeId}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleEdit(row.id)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(row.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Form Dialog */}
      <Dialog open={openDialog} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Create Item Issue</DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={2}>
            {/* INWO Dropdown */}
            <FormControl fullWidth>
              <InputLabel>Internal Work Order</InputLabel>
              <Select
                value={formData.inwo}
                onChange={(e) => handleInwoChange(e.target.value)}
              >
                {inwoList.map((inwo) => (
                  <MenuItem key={inwo.id} value={inwo.id}>
                    {`INWO-${inwo.id} (WOID: ${inwo.woid})`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Job Card Dropdown */}
            <FormControl fullWidth>
              <InputLabel>Job Card</InputLabel>
              <Select
                value={formData.jobcardId}
                onChange={(e) => handleJobCardChange(e.target.value)}
              >
                {jobCardList.map((jcId) => (
                  <MenuItem key={jcId} value={jcId}>
                    JobCard-{jcId}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Operation Dropdown */}
            <FormControl fullWidth>
  <InputLabel>Operation</InputLabel>
  <Select
    value={formData.operation}
    onChange={(e) => handleChange("operation", e.target.value)}
  >
    {operationList.map((op) => (
      <MenuItem key={op.id} value={op.name}>
        {op.name}
      </MenuItem>
    ))}
  </Select>
</FormControl>



            <FormControl fullWidth margin="normal">
  <InputLabel id="employee-label">Employee Name</InputLabel>
  <Select
    labelId="employee-label"
    value={formData.employeeId || ""}
    onChange={(e) =>
      setFormData({ ...formData, employeeId: e.target.value })
    }
  >
    <MenuItem value="">
      <em>Select Employee</em>
    </MenuItem>
    <MenuItem value={1}>John Doe</MenuItem>
    <MenuItem value={2}>Jane Smith</MenuItem>
    <MenuItem value={3}>Rahul Kumar</MenuItem>
  </Select>
</FormControl>


            {/* Item Dropdown */}
            <FormControl fullWidth>
              <InputLabel>Item</InputLabel>
              <Select
                value={formData.itemId}
                onChange={(e) => handleChange("itemId", e.target.value)}
              >
                {itemList.map((id) => (
                  <MenuItem key={id} value={id}>
                    Item-{id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Quantity */}
            <TextField
              label="Quantity"
              type="number"
              value={formData.quantityIssued}
              onChange={(e) => handleChange("quantityIssued", e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default ItemPage
