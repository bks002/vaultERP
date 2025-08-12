import React, { useEffect, useState } from "react";
import { TableContainer, Paper } from "@mui/material";

import {
  Box,
  Typography,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Tooltip,
  IconButton,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import ViewIcon from '@mui/icons-material/Visibility';
import { useSelector } from "react-redux";
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import { getAllOperation } from "../../Services/OperationService.js";
import { getWorkOrders } from "../../Services/WorkOrderService.js";
import { getInternalWorkOrdersByOffice } from '../../Services/InternalWorkOrderService.js';
import { getProductByID } from "../../Services/ProductMasterService.js"; // <-- Add this service
import axios from "axios";
import { getConstructionDesignSheets, createConstruction , updateConstructionDesignSheet, deleteConstructionDesignSheet } from "../../Services/ConstructionDesignSheet.js";


const ConstructionDesignSheet = () => {
  const officeId = useSelector((state) => state.user.officeId);

  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [constructionData, setConstructionData] = useState([]);


  // Dropdown states
  const [internalWorkOrders, setInternalWorkOrders] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [operations, setOperations] = useState([]);

  const [selectedInternalWO, setSelectedInternalWO] = useState("");

  // Map of productId to productName for quick lookup
  const [productDetailsMap, setProductDetailsMap] = useState({});

  // Table data
  const [operationData, setOperationData] = useState([]);
    const [selectedWO, setSelectedWO]= useState("");
  // Form for adding operation
  const [selectedOperation, setSelectedOperation] = useState("");
  const [specification, setSpecification] = useState("");
  const [value, setValue] = useState("");


  useEffect(() => {
    if (officeId > 0) {
      loadInternalWorkOrders();
      loadOperations();
    //   loadWorkOrders();
      loadConstructionData();
    }
  }, [officeId]);

const loadConstructionData = async () => {
  try {
    const data = await getConstructionDesignSheets(officeId);
    setConstructionData(data || []);
  } catch (err) {
    console.error("Error fetching construction design sheets:", err.message);
  }
};

 const handleSubmit = async () => {
  try {
    const payload = [
      {
        id: 0,
        internalWoid: selectedInternalWO, // tumhare form ka value
        operationId: selectedOperation,
        specification: specification,
        value: value,
        officeId: officeId,
        isActive: true,
        createdOn: new Date().toISOString(),
        createdBy: 0,
        updatedBy: 0,
        updatedOn: new Date().toISOString()
      }
    ];

    await createConstruction(payload); // service ka function jo tumhare paas hoga
    alert("Construction data submitted successfully!");
  } catch (error) {
    console.error("Error submitting construction data:", error);
  }
};


  const loadInternalWorkOrders = async () => {
    try {
      const data = await getInternalWorkOrdersByOffice(officeId);
      console.log("Internal Work Orders fetched:", data);
      setInternalWorkOrders(data || []);
    } catch (err) {
      console.error("Failed to fetch internal work orders:", err.message);
    }
  };

  const loadWorkOrders = async (officeId) => {
    try {
      const data = await getWorkOrders(officeId);
      setWorkOrders(data || []);

      // Extract all product IDs from all work orders
      let productIds = [];
      data.forEach(wo => {
        if (wo.products && wo.products.length > 0) {
          productIds = productIds.concat(
            wo.products.map(p => p.productId)
          );
        }
      });

      // Remove duplicates
      productIds = [...new Set(productIds)];

      if (productIds.length > 0) {
        const products = await getProductByID(productIds);
        // Map product ID => product name
        const productMap = {};
        products.forEach(p => {
          productMap[p.id] = p.name; // Adjust based on your API response keys
        });
        setProductDetailsMap(productMap);
      } else {
        setProductDetailsMap({});
      }
    } catch (err) {
      console.error("Failed to fetch work orders or products:", err.message);
    }
  };

  const loadOperations = async () => {
    try {
      const data = await getAllOperation(officeId);
      setOperations(data || []);
    } catch (err) {
      console.error("Failed to fetch operations:", err.message);
    }
  };

  const handleAddOperation = () => {
    if (selectedOperation && specification && value) {
      setOperationData([
        ...operationData,
        {
          id: Date.now(),
          operationName: selectedOperation,
          specification,
          value,
        },
      ]);
    }
  };

  const handleDelete = (id) => {
    setOperationData(operationData.filter((op) => op.id !== id));
  };

  const handleEdit = (id) => {
    const item = operationData.find((op) => op.id === id);
    if (item) {
      setSelectedOperation(item.operationName);
      setSpecification(item.specification);
      setValue(item.value);
      setOperationData(operationData.filter((op) => op.id !== id));
    }
  };

  const filteredWorkOrders = selectedWO
  ? workOrders.filter(wo => wo.woid === selectedWO)
  : [];


  return (
                 <div className="col-12">
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h4">Construction Design Sheet</Typography>     
                     <Box display="flex" alignItems="center" gap={2}>
                    <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setOpenDialog(true)}
                    >
                    Create
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
                                                <TableCell>Internal Work Order</TableCell>
                                                <TableCell>Operation Name</TableCell>
                                                <TableCell>Specification</TableCell>
                                                <TableCell>Value</TableCell>
                                                <TableCell align="center">Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                           {constructionData.length > 0 ? (
  constructionData.map((row, index) => (
    <TableRow key={row.id}>
      <TableCell>{index + 1}</TableCell>
      <TableCell>{internalWorkOrders.find(w => w.id === row.internalWoid)?.woNumber || "-"}</TableCell>
      <TableCell>{operations.find(op => op.operationId === row.operationId)?.operationName || "-"}</TableCell>
      <TableCell>{row.specification}</TableCell>
      <TableCell>{row.value}</TableCell>
   
                                                        
                                                        <TableCell align="center">
                                                            {/* <Tooltip title="Edit">
                                                                <IconButton color="primary" onClick={() => handleEdit(wo)}>
                                                                    <EditIcon />
                                                                </IconButton>
                                                            </Tooltip> */}
                                                            <Tooltip title="View">
                                                                <IconButton color="primary" onClick={() => handleView(wo)}>
                                                                    <ViewIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Delete">
                                                                <IconButton color="error" onClick={() => handleDelete(wo)}>
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                            
                                                            <Tooltip title="View Details">
                                                <IconButton color="info" onClick={() => handleDetail(wo)}>
                                                    <InfoIcon />
                                                </IconButton>
                                            </Tooltip>
                                                                                    </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={9} align="center">
                                                        No construction design sheet found.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                 )}

                {/* Dialog */}
                <Dialog
                    open={openDialog}
                    onClose={() => setOpenDialog(false)}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>Create Construction Design Sheet</DialogTitle>
                    <DialogContent>
                    {/* Internal Work Order dropdown */}
                    <Stack spacing={2} mt={1}>
                        <TextField
                        select
                        label="Internal Work Order"
                        name="internalWorkOrderId"
                        value={selectedInternalWO}
                        onChange={(e) => {
                            const val = e.target.value;
                            setSelectedInternalWO(val);
                            setWorkOrders([]); // reset
                            const internalWO = internalWorkOrders.find(w => w.id === val);
            setSelectedWO(internalWO ? internalWO.woid : "");
                            setProductDetailsMap({}); // reset products map
                            loadWorkOrders(officeId);
                        }}
                        fullWidth
                        sx={{ mt: 2 }}
                        SelectProps={{ native: true }}
                        >
                        <option value=""></option>
                        {internalWorkOrders.map((wo) => (
                            <option key={wo.id} value={wo.id}>
                            {`WO-${wo.woid} | Qty: ${wo.quantity} | Dispatch: ${wo.dispatchDate?.substring(0, 10)}`}
                            </option>
                        ))}
                        </TextField>

                        {/* Showing Products for Work Orders of selected Internal WO */}
                        <Box mt={2}>
                        <Typography variant="subtitle1" gutterBottom>
                            Products in Work Orders:
                        </Typography>
                        {filteredWorkOrders.length === 0 && (
            <Typography>No work orders found.</Typography>
            )}

            {filteredWorkOrders.map((wo) => (
            <Box
                key={wo.id}
                sx={{ mb: 2, p: 1, border: "1px solid #ccc", borderRadius: 1 }}
            >
                <Typography fontWeight="bold">
                Work Order: {wo.name || wo.woid || wo.id}
                </Typography>

                {wo.products && wo.products.length > 0 ? (
                <ul>
                    {wo.products.map((product) => (
                    <li key={product.productId || product.name}>
                        {productDetailsMap[product.productId] ||
                        product.name ||
                        product.description ||
                        "Unknown Product"}
                    </li>
                    ))}
                </ul>
                ) : (
                <Typography>No products found for this Work Order.</Typography>
                )}
            </Box>
            ))}
            </Box>
          </Stack>

          {/* Table */}
          <Box mt={3}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Operation Name</TableCell>
                  <TableCell>Specification</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {operationData.length > 0 ? (
                  operationData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.operationName}</TableCell>
                      <TableCell>{row.specification}</TableCell>
                      <TableCell>{row.value}</TableCell>
                      <TableCell>
                        <IconButton color="primary" onClick={() => handleEdit(row.id)}>
                          <Edit />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDelete(row.id)}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No operations added
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>

          {/* Add Operation Form */}
          <Box mt={3}>
            <Stack direction="row" spacing={2}>
              <TextField
                select
                label="Operation Name"
                value={selectedOperation}
                onChange={(e) => setSelectedOperation(e.target.value)}
                fullWidth
              >
                {operations.map((op) => (
                  <MenuItem key={op.operationId} value={op.operationId}>
                    {op.operationName}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Specification"
                value={specification}
                onChange={(e) => setSpecification(e.target.value)}
                fullWidth
              />

              <TextField
                label="Value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                fullWidth
              />

              <Button variant="contained" color="primary" onClick={handleAddOperation}>
                Create
              </Button>
            </Stack>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            onClick={() =>
              handleSubmit ( selectedInternalWO, selectedOperation )
            }
          >
            Submit All
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ConstructionDesignSheet;
