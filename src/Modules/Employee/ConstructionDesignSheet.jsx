import React, { useState } from 'react';
import {
  Container, Typography, Box, IconButton, Tooltip, Table, TableHead, TableRow,
  TableCell, TableBody, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Stack, Select, MenuItem, FormControl, InputLabel, TextField, InputAdornment
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import AlertSnackbar from "../../Components/Alert/AlertSnackBar";

const ConstructionDesignSheet = () => {
  // Dummy data
  const workOrders = ['WO-001', 'WO-002', 'WO-003'];
  const operations = ['Cutting', 'Welding', 'Painting'];

  const [records, setRecords] = useState([
    { id: 1, workOrder: 'WO-001', operationName: 'Cutting' },
    { id: 2, workOrder: 'WO-002', operationName: 'Welding' },
    { id: 3, workOrder: 'WO-003', operationName: 'Painting' },
  ]);

  const [alert, setAlert] = useState({ open: false, type: 'success', message: '' });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('view');
  const [selectedRecord, setSelectedRecord] = useState({ id: '', workOrder: '', operationName: '' });

  // Add Construction Dialog states
  const [constructionDialogOpen, setConstructionDialogOpen] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState('');
  const [selectedOperation, setSelectedOperation] = useState('');
  const [products, setProducts] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  const showAlert = (type, message) => {
    setAlert({ open: true, type, message });
  };

  const handleView = (record) => {
    setSelectedRecord(record);
    setDialogMode('view');
    setDialogOpen(true);
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleDelete = (record) => {
    if (window.confirm(`Are you sure you want to delete "${record.workOrder}"?`)) {
      setRecords(records.filter(r => r.id !== record.id));
      showAlert('success', 'Record deleted successfully');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedRecord({ ...selectedRecord, [name]: value });
  };

  const handleSave = () => {
    setRecords(records.map(r => r.id === selectedRecord.id ? selectedRecord : r));
    showAlert('success', 'Record updated successfully');
    setDialogOpen(false);
  };

  const handleAddProduct = () => {
    if (!selectedWorkOrder || !selectedOperation) {
      showAlert('error', 'Please select both Work Order and Operation Name');
      return;
    }
    const newProduct = { workOrder: selectedWorkOrder, operationName: selectedOperation };

    if (editIndex !== null) {
      const updatedProducts = [...products];
      updatedProducts[editIndex] = newProduct;
      setProducts(updatedProducts);
      setEditIndex(null);
    } else {
      setProducts([...products, newProduct]);
    }

    setSelectedWorkOrder('');
    setSelectedOperation('');
  };

  const handleEditProduct = (index) => {
    const product = products[index];
    setSelectedWorkOrder(product.workOrder);
    setSelectedOperation(product.operationName);
    setEditIndex(index);
  };

  const handleDeleteProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const handleCreateConstruction = () => {
    if (products.length === 0) {
      showAlert('error', 'Please add at least one product');
      return;
    }
    const newId = records.length ? Math.max(...records.map(r => r.id)) + 1 : 1;
    products.forEach(prod => {
      setRecords(prev => [...prev, { id: newId + Math.random(), ...prod }]);
    });
    setConstructionDialogOpen(false);
    setProducts([]);
    showAlert('success', 'Construction Design created successfully');
  };

  // Filter records based on search query
  const filteredRecords = records.filter(rec =>
    rec.workOrder.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rec.operationName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container maxWidth={false}>
      {/* Heading + Search + Button in Same Row */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2, gap: 2 }}>
        <Typography variant="h4">Internal Work Orders</Typography>

        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            sx={{ width: '310px' }}
            placeholder="Search by Work Order or Operation"
            variant="outlined"
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
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setConstructionDialogOpen(true)}
          >
            Add Construction Design
          </Button>
        </Box>
      </Box>

      {/* Main Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Internal Work Order</TableCell>
            <TableCell>Operation Name</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredRecords.length > 0 ? (
            filteredRecords.map((rec, index) => (
              <TableRow key={rec.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{rec.workOrder}</TableCell>
                <TableCell>{rec.operationName}</TableCell>
                <TableCell align="center">
                  <Tooltip title="View">
                    <IconButton onClick={() => handleView(rec)} color="info">
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleEdit(rec)} color="primary">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => handleDelete(rec)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} align="center">No matching records found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* View/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{dialogMode === 'view' ? 'View Record' : 'Edit Record'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <FormControl fullWidth>
              <InputLabel>Internal Work Order</InputLabel>
              <Select
                name="workOrder"
                value={selectedRecord.workOrder}
                onChange={handleChange}
                disabled={dialogMode === 'view'}
              >
                {workOrders.map(wo => <MenuItem key={wo} value={wo}>{wo}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Operation Name</InputLabel>
              <Select
                name="operationName"
                value={selectedRecord.operationName}
                onChange={handleChange}
                disabled={dialogMode === 'view'}
              >
                {operations.map(op => <MenuItem key={op} value={op}>{op}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          {dialogMode === 'edit' && (
            <Button variant="contained" onClick={handleSave}>Save</Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Add Construction Dialog */}
      <Dialog
        open={constructionDialogOpen}
        onClose={() => setConstructionDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add Construction Design</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <FormControl fullWidth>
              <InputLabel>Internal Work Order</InputLabel>
              <Select
                value={selectedWorkOrder}
                onChange={(e) => setSelectedWorkOrder(e.target.value)}
              >
                {workOrders.map(wo => <MenuItem key={wo} value={wo}>{wo}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Operation Name</InputLabel>
              <Select
                value={selectedOperation}
                onChange={(e) => setSelectedOperation(e.target.value)}
              >
                {operations.map(op => <MenuItem key={op} value={op}>{op}</MenuItem>)}
              </Select>
            </FormControl>
            <Button variant="contained" onClick={handleAddProduct}>
              Add Product
            </Button>
          </Stack>

          <Typography variant="h6" sx={{ mt: 3 }}>Products</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Work Order</TableCell>
                <TableCell>Operation Name</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.length > 0 ? (
                products.map((prod, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{prod.workOrder}</TableCell>
                    <TableCell>{prod.operationName}</TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton color="primary" onClick={() => handleEditProduct(idx)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton color="error" onClick={() => handleDeleteProduct(idx)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">No products added</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConstructionDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateConstruction}>Create</Button>
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

export default ConstructionDesignSheet;
