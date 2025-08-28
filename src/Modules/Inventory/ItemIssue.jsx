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
} from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"

import { getAllOperation, getEmployeesByOperation } from "../../Services/OperationService"
import {
  fetchItemIssues,
  createItemIssue,
  deleteItemIssue,
  fetchInternalWorkOrders,
  fetchJobCardsByInternalWo,
  fetchOperationsByJobCard,
  fetchItemsByInternalWoid,
} from "../../Services/ItemIssueService"
import { getItemById } from "../../Services/InventoryService"  
import { useSelector } from 'react-redux';

const ItemPage = () => {
  const officeId = useSelector((state) => state.user.officeId);
  const [rows, setRows] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [formData, setFormData] = useState({
    id: 0,
    inwo: "",
    jobcardId: "",
    operation: "",
    employeeId: "",
    itemId: "",
    quantityIssued: "",
  })
  const [isEditMode, setIsEditMode] = useState(false)

  // Dropdown data
  const [inwoList, setInwoList] = useState([])
  const [jobCardList, setJobCardList] = useState([])
  const [operationList, setOperationList] = useState([])
  const [employeeList, setEmployeeList] = useState([])   
  const [itemList, setItemList] = useState([])

  // Master Data for Dashboard mapping
  const [allItems, setAllItems] = useState([])
  const [allEmployees, setAllEmployees] = useState([])
  const [allOperations, setAllOperations] = useState([])
  const [allInwos, setAllInwos] = useState([])
  const [allJobCards, setAllJobCards] = useState([])

  // Load all Item Issues initially + preload masters
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchItemIssues(officeId)
        setRows(data || [])

        const inwos = await fetchInternalWorkOrders(officeId)
        setAllInwos(inwos || [])

        const ops = await getAllOperation(officeId)
        setAllOperations(ops || [])

        let itemMaster = []
        for (const inwo of inwos || []) {
          const items = await fetchItemsByInternalWoid(inwo.id)
          if (items?.itemIds?.length) {
            const itemDetails = await Promise.all(
              items.itemIds.map(async (id) => {
                const data = await getItemById(id)
                return { id, name: data?.name || `Item-${id}` }
              })
            )
            itemMaster = [...itemMaster, ...itemDetails]
          }
        }
        setAllItems(itemMaster)

        let jobCardMaster = []
        for (const inwo of inwos || []) {
          const jobcards = await fetchJobCardsByInternalWo(inwo.id)
          jobCardMaster = [...jobCardMaster, ...(jobcards || [])]
        }
        setAllJobCards(jobCardMaster)

        let empMaster = []
        for (const op of ops || []) {
          const employees = await getEmployeesByOperation(op.id) // use numeric ID
          empMaster = [...empMaster, ...(employees || [])]
        }
        setAllEmployees(empMaster)

      } catch (error) {
        console.error("Error loading dashboard data:", error)
      }
    }
    loadData()
  }, [officeId])

  // ✅ Edit handler with correct prefetch
  const handleEdit = async (id) => {
    const row = rows.find(r => r.id === id)
    if (!row) return

    setIsEditMode(true)
    setOpenDialog(true)

    try {
      const inwos = await fetchInternalWorkOrders(officeId)
      setInwoList(inwos || [])

      const jobCards = await fetchJobCardsByInternalWo(row.inwo)
      setJobCardList(jobCards || [])
      setAllJobCards((prev) => [...prev, ...(jobCards || [])])

      const operations = await fetchOperationsByJobCard(row.jobcardId)
      setOperationList(operations || [])
      setAllOperations((prev) => [...prev, ...(operations || [])])

      // ✅ Fetch employees using operation ID
      const employees = await getEmployeesByOperation(row.operation)
      setEmployeeList(employees || [])
      setAllEmployees((prev) => [...prev, ...(employees || [])])

      const items = await fetchItemsByInternalWoid(row.inwo)
      if (items?.itemIds?.length) {
        const itemDetails = await Promise.all(
          items.itemIds.map(async (id) => {
            const data = await getItemById(id)
            return { id, name: data?.name || `Item-${id}` }
          })
        )
        setItemList(itemDetails)
        setAllItems((prev) => [...prev, ...itemDetails])
      }

      setFormData({
        id: row.id,
        inwo: row.inwo,
        jobcardId: row.jobcardId,
        operation: row.operation,
        employeeId: row.employeeId,
        itemId: row.itemId,
        quantityIssued: row.quantityIssued,
      })
    } catch (error) {
      console.error("Error preparing edit form:", error)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteItemIssue(id)
      setRows(rows.filter((row) => row.id !== id))
    } catch (error) {
      console.error("Delete failed", error)
    }
  }

  const reloadRows = async () => {
    try {
      const data = await fetchItemIssues(officeId)
      setRows(data || [])
    } catch (error) {
      console.error("Error reloading rows:", error)
    }
  }

  const handleCreate = async () => {
    setIsEditMode(false)
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
      id: 0,
      inwo: "",
      jobcardId: "",
      operation: "",
      employeeId: "",
      itemId: "",
      quantityIssued: "",
    })
    setJobCardList([])
    setOperationList([])
    setEmployeeList([])   
    setItemList([])
    setIsEditMode(false)
  }

  const handleSave = async () => {
    try {
      const operationName = operationList.find(op => (op.id || op.operationId) === formData.operation)?.name || formData.operation

      const payload = {
        id: formData.id,
        inwo: Number(formData.inwo),
        jobcardId: Number(formData.jobcardId),
        operation: operationName,
        employeeId: Number(formData.employeeId),
        itemId: Number(formData.itemId),
        quantityIssued: Number(formData.quantityIssued),
        createdBy: 1, 
        createdOn: new Date().toISOString(),
        isActive: true,
        officeId: officeId,
      }

      await createItemIssue(payload)
      await reloadRows()
      handleClose()
    } catch (error) {
      console.error("Save failed:", error)
    }
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleInwoChange = async (inwoId) => {
    handleChange("inwo", inwoId)

    try {
      const items = await fetchItemsByInternalWoid(inwoId)
      if (items?.itemIds?.length) {
        const itemDetails = await Promise.all(
          items.itemIds.map(async (id) => {
            const data = await getItemById(id)
            return { id, name: data?.name || `Item-${id}` }
          })
        )
        setItemList(itemDetails)
        setAllItems((prev) => [...prev, ...itemDetails])
      } else {
        setItemList([])
      }
    } catch (error) {
      console.error("Error fetching items:", error)
      setItemList([])
    }

    const jobCards = await fetchJobCardsByInternalWo(inwoId)
    setJobCardList(jobCards || [])
    setAllJobCards((prev) => [...prev, ...(jobCards || [])])

    setOperationList([])
    setEmployeeList([])   
    handleChange("jobcardId", "")
    handleChange("operation", "")
    handleChange("employeeId", "")

    const allOperations = await getAllOperation(officeId)
    setOperationList(allOperations || [])
    setAllOperations(allOperations || [])
  }

  const handleJobCardChange = async (jobCardId) => {
    handleChange("jobcardId", jobCardId)

    try {
      if (jobCardId) {
        const operations = await fetchOperationsByJobCard(jobCardId)
        setOperationList(operations || [])
        setAllOperations((prev) => [...prev, ...(operations || [])])
      } else {
        const allOperations = await getAllOperation(officeId)
        setOperationList(allOperations || [])
      }
      setEmployeeList([])
      handleChange("operation", "")
      handleChange("employeeId", "")
    } catch (error) {
      console.error("Error fetching operations:", error)
      setOperationList([])
    }
  }

  const handleOperationChange = async (operationId) => {
    handleChange("operation", operationId)
    handleChange("employeeId", "")

    try {
      if (operationId) {
        const employees = await getEmployeesByOperation(operationId) // ✅ send ID
        setEmployeeList(employees || [])
        setAllEmployees((prev) => [...prev, ...(employees || [])])
      } else {
        setEmployeeList([])
      }
    } catch (error) {
      console.error("Error fetching employees:", error)
      setEmployeeList([])
    }
  }

  const getItemName = (id) => allItems.find((i) => i.id === id)?.name || id
  const getEmployeeName = (id) => allEmployees.find((e) => e.employeeId === id)?.employeeName || id
  const getJobCardName = (id) => allJobCards.find((j) => j.id === id)?.name || id
  const getInwoName = (id) => allInwos.find((w) => w.id === id)?.name || id
  const getOperationName = (id) => allOperations.find((o) => (o.id || o.operationId) === id)?.name || id

  return (
    <div className="col-12">
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4">Item Issue</Typography>
        <Button variant="contained" color="primary" onClick={handleCreate}>
          Create Item Issue
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableRow>
            <TableCell><b>Item</b></TableCell>
            <TableCell><b>Quantity Issued</b></TableCell>
            <TableCell><b>INWO</b></TableCell>
            <TableCell><b>Jobcard</b></TableCell>
            <TableCell><b>Operation</b></TableCell>
            <TableCell><b>Employee</b></TableCell>
            <TableCell><b>Action</b></TableCell>
          </TableRow>

          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{getItemName(row.itemId)}</TableCell>
                <TableCell>{row.quantityIssued}</TableCell>
                <TableCell>{getInwoName(row.inwo)}</TableCell>
                <TableCell>{getJobCardName(row.jobcardId)}</TableCell>
                <TableCell>{getOperationName(row.operation)}</TableCell>
                <TableCell>{getEmployeeName(row.employeeId)}</TableCell>
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

      {/* Create/Edit Form Dialog */}
      <Dialog open={openDialog} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{isEditMode ? "Edit Item Issue" : "Create Item Issue"}</DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={2}>
            <FormControl fullWidth>
              <InputLabel>Internal Work Order</InputLabel>
              <Select
                value={formData.inwo}
                onChange={(e) => handleInwoChange(e.target.value)}
              >
                {inwoList.map((inwo) => (
                  <MenuItem key={inwo.id} value={inwo.id}>
                    {inwo.id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Job Card</InputLabel>
              <Select
                value={formData.jobcardId}
                onChange={(e) => handleJobCardChange(e.target.value)}
              >
                {jobCardList.map((jcId) => (
                  <MenuItem key={jcId} value={jcId}>
                    {jcId}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Operation</InputLabel>
              <Select
                value={formData.operation}
                onChange={(e) => handleOperationChange(e.target.value)}   
              >
                {operationList.map((op) => (
                  <MenuItem key={op.id || op.operationId} value={op.id || op.operationId}>
                    {op.name || op.operationName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Employee</InputLabel>
              <Select
                value={formData.employeeId}
                onChange={(e) => handleChange("employeeId", e.target.value)}
              >
                <MenuItem value=""><em>Select Employee</em></MenuItem>
                {employeeList.map((emp) => (
                  <MenuItem key={emp.employeeId} value={emp.employeeId}>
                    {emp.employeeName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Item</InputLabel>
              <Select
                value={formData.itemId}
                onChange={(e) => handleChange("itemId", e.target.value)}
              >
                {itemList.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

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
