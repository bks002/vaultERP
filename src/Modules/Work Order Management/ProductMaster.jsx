import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow,
  TableContainer, IconButton, Paper, Typography, Tooltip,
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Stack, InputAdornment
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import {getProductMasters, createProductMaster, updateProductMaster, deleteProductMaster} from '../../Services/ProductMasterService';
import { useSelector } from 'react-redux';

const ProductMaster = () => {
  const officeId = useSelector((state) => state.user.officeId);
  const [searchQuery, setSearchQuery] = useState('');
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState({
    id: '',
    product_name: '',
    description: '',
    rate: '',
    unit: '',
    is_active: 1,
    createdon: '',
    createdby: '',
    updatedon:'',
    updatedby: '',
  });

  const loadVendors = async () => {
    setLoading(true);
    try {
      const data = await getProductMasters(officeId);
      setVendors(data);
    } catch (error) {
      alert('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

 useEffect(() => {
  if (!officeId) return;
  loadVendors();
}, [officeId]);

  const handleCreateNew = () => {
    setSelectedVendor({ product_name: '', description: '', rate: '', unit: '', });
    setIsEdit(false);
    setDialogOpen(true);
  };

  const handleEdit = (vendor) => {
  setSelectedVendor({
    ...vendor,
    officeId: vendor.officeId || officeId, // fallback if missing
  });
  setIsEdit(true);
  setDialogOpen(true);
};


  const handleDelete = async (vendor) => {
    if (window.confirm(`Are you sure you want to delete "${vendor.name}"?`)) {
      try {
        await deleteProductMaster(vendor.id);
        alert('Vendor deleted successfully!');
        loadVendors();
      } catch (error) {
        alert('Failed to delete vendor');
      }
    }
  };

 const handleSave = async () => {
  const payload = {
    id: isEdit ? selectedVendor.id : undefined,
    product_name: selectedVendor.product_name,
    description: selectedVendor.description,
    rate: Number(selectedVendor.rate),
    unit: selectedVendor.unit,
    createdBy: 1,
    createdOn: new Date().toISOString(),
    office_id: Number(officeId),
  };

  try {
    if (isEdit) {
      await updateProductMaster(selectedVendor.id, payload);
      alert('Product updated successfully!');
    } else {
      await createProductMaster(payload);
      alert('Product created successfully!');
    }
    setDialogOpen(false);
    loadVendors();
  } catch (error) {
    console.error("❌ Error from backend:", error.response?.data || error.message);
    alert('Failed to save product');
  }
};


  const filteredVendors = vendors.filter((v) =>
    v.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.rate?.toString().includes(searchQuery) ||
    v.unit?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="col-12">
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4">Product Master</Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            placeholder="Search by name, rate or unit"
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
          <Button variant="contained" color="primary" onClick={handleCreateNew}>
            Create New Product Master
          </Button>
        </Box>
      </Box>

      {loading && <Typography>Loading data...</Typography>}

      {!loading && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVendors.length > 0 ? (
                filteredVendors.map((vendor, index) => (
                  <TableRow key={vendor.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{vendor.product_name}</TableCell>
                    <TableCell>{vendor.description}</TableCell>
                    <TableCell>{vendor.rate}</TableCell>
                    <TableCell>{vendor.unit}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton color="primary" onClick={() => handleEdit(vendor)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton color="error" onClick={() => handleDelete(vendor)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No product found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{isEdit ? 'Edit Product' : 'Create New Product Master'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Name"
              value={selectedVendor.product_name}
              onChange={(e) => setSelectedVendor({ ...selectedVendor, product_name: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Description"
              value={selectedVendor.description}
              onChange={(e) => setSelectedVendor({ ...selectedVendor, description: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Price"
              type="number"
              value={selectedVendor.rate}
              onChange={(e) => setSelectedVendor({ ...selectedVendor, rate: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Unit"
              value={selectedVendor.unit}
              onChange={(e) => setSelectedVendor({ ...selectedVendor, unit: e.target.value })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            disabled={!selectedVendor.product_name?.trim() || !selectedVendor.description?.trim()}
          >
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProductMaster;
