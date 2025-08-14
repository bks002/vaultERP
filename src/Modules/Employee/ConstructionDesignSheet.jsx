import React, { useEffect, useState } from "react";
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
  TableContainer,
  Paper,
} from "@mui/material";
import ViewIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSelector } from "react-redux";

import { getAllOperation } from "../../Services/OperationService.js";
import { getWorkOrders } from "../../Services/WorkOrderService.js";
import { getInternalWorkOrdersByOffice } from "../../Services/InternalWorkOrderService.js";
import { getProductByID } from "../../Services/ProductMasterService.js";

import {
  getConstructionDesignSheets,
  createConstruction,
  updateConstructionDesignSheet,
  deleteConstructionDesignSheet,
} from "../../Services/ConstructionDesignSheet.js";

const ConstructionDesignSheet = () => {
  const officeId = useSelector((state) => state.user.officeId);

  const [openDialog, setOpenDialog] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [constructionData, setConstructionData] = useState([]);

  // Dropdown states
  const [internalWorkOrders, setInternalWorkOrders] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [operations, setOperations] = useState([]);

  // Form fields (TOP dialog)
  const [selectedInternalWO, setSelectedInternalWO] = useState("");
  const [selectedOperation, setSelectedOperation] = useState("");
  const [specification, setSpecification] = useState("");
  const [value, setValue] = useState("");

  // Misc maps / helpers
  const [productDetailsMap, setProductDetailsMap] = useState({});
  const [selectedWO, setSelectedWO] = useState("");

  // Mode control
  const [isEdit, setIsEdit] = useState(false);
  const [selectedCDS, setSelectedCDS] = useState(null);

  // Inner table (local-only) rows & handlers
  const [operationData, setOperationData] = useState([]);

  const [isViewEditMode, setIsViewEditMode] = useState(false);
const [viewValue, setViewValue] = useState("");
const [viewOperationData, setViewOperationData] = useState([]);


  useEffect(() => {
    if (Number(officeId) > 0) {
      (async () => {
        setLoading(true);
        try {
          await Promise.all([loadInternalWorkOrders(), loadOperations(), loadConstructionData()]);
        } finally {
          setLoading(false);
        }
      })();
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

  const loadInternalWorkOrders = async () => {
    try {
      const data = await getInternalWorkOrdersByOffice(officeId);
      setInternalWorkOrders(data || []);
    } catch (err) {
      console.error("Failed to fetch internal work orders:", err.message);
    }
  };

  const loadWorkOrders = async (officeIdParam) => {
    try {
      const data = await getWorkOrders(officeIdParam);
      setWorkOrders(data || []);

      // Collect productIds
      let productIds = [];
      data?.forEach((wo) => {
        if (wo?.products?.length) {
          productIds = productIds.concat(wo.products.map((p) => p.productId));
        }
      });
      productIds = [...new Set(productIds)].filter(Boolean);

      if (productIds.length > 0) {
        const products = await getProductByID(productIds);
        const productMap = {};
        (products || []).forEach((p) => {
          // adjust keys if your API differs
          productMap[p.id] = p.name;
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

  // ---------- Helpers to resolve IDs safely ----------
  const resolveInternalWOId = (rowInternalWoid) => {
    // rowInternalWoid might be an internal WO "id" or a "woid" (human code).
    if (!rowInternalWoid) return "";
    // 1) exact id match
    const byId = internalWorkOrders.find((w) => String(w.id) === String(rowInternalWoid));
    if (byId) return byId.id;
    // 2) woid match (if row stores woid instead of id)
    const byWoid = internalWorkOrders.find((w) => String(w.woid) === String(rowInternalWoid));
    if (byWoid) return byWoid.id;
    return "";
  };

  const resolveOperationId = (rowOperationId, rowOperationName) => {
    if (rowOperationId) return rowOperationId;
    if (rowOperationName) {
      const found = operations.find(
        (o) => String(o.operationName).toLowerCase() === String(rowOperationName).toLowerCase()
      );
      return found ? found.operationId : "";
    }
    return "";
  };

  // ---------- Top table actions ----------
 const handleViewCDS = (row) => {
  setSelectedCDS(row);
  setViewOperationData(
    row.operations?.map((op, index) => ({
      ...op,
      id: index, // local unique id
    })) || [{ id: Date.now(), specification: row.specification, value: row.value }]
  );
  setIsViewEditMode(false);
  setViewOpen(true);
};


// New function for update from view dialog
const handleUpdateValueOnly = async () => {
  console.log(selectedCDS)
  try {
    if (!selectedCDS) return;

    const payload = {
      id: selectedCDS.id,
      internalWoid: selectedCDS.internalWoid,  // Keep existing
      operationId: selectedCDS.operationId,    // Keep existing
      specification: selectedCDS.specification || "",
      value: viewValue,                        // Only field we change
      officeId: Number(officeId),
      isActive: true,
      updatedOn: new Date().toISOString(),
      updatedBy: 0,
    };

    console.log("Updating with payload:", payload);
    await updateConstructionDesignSheet(selectedCDS.id, payload);

    alert("Value updated successfully!");
    setIsViewEditMode(false);
    setViewOpen(false);
    await loadConstructionData();
  } catch (err) {
    console.error("Error updating value:", err.response?.data || err.message);
    alert("Failed to update value");
  }
};


  const handleEditCDS = (row) => {
    setSelectedCDS(row);
    setIsEdit(true);

    // Prefill dialog fields
    const internalId = resolveInternalWOId(row.internalWoid);
    setSelectedInternalWO(internalId || "");
    const opId = resolveOperationId(row.operationId, row.operationName);
    setSelectedOperation(opId || "");
    setSpecification(row.specification || "");
    setValue(row.value || "");

    // (optional) pre-load workorders/products area
    setWorkOrders([]);
    const internalWO = internalWorkOrders.find((w) => String(w.id) === String(internalId));
    setSelectedWO(internalWO ? internalWO.woid : "");
    setProductDetailsMap({});
    loadWorkOrders(officeId);

    setOpenDialog(true);
  };

  const handleDeleteCDS = async (row) => {
    console.log(row)
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await deleteConstructionDesignSheet(Number(row.internalWoid));
        alert("Record deleted successfully");
        await loadConstructionData();
      } catch (e) {
        console.error(e);
        alert("Failed to delete record");
      }
    }
  };
  // ---------- Create / Update submit ----------
  const handleSubmit = async () => {
    try {
      // Coerce ids to number when possible (helps many APIs)
      const internalWoidId = selectedInternalWO ? Number(selectedInternalWO) : null;
      const operationIdNum = selectedOperation ? Number(selectedOperation) : null;

      if (selectedCDS) {
        const payload = {
          id: selectedCDS.id,
          internalWoid: internalWoidId ?? selectedInternalWO ?? "",
          operationId: operationIdNum ?? selectedOperation ?? "",
          specification: specification,
          value: value,
          officeId: Number(officeId),
          isActive: true,
          updatedOn: new Date().toISOString(),
          updatedBy: 0,
        };
        await updateConstructionDesignSheet(selectedCDS.id, payload);
        alert("Construction data updated successfully!");
      } else {
        const payload = [
          {
            id: 0,
            internalWoid: internalWoidId ?? selectedInternalWO ?? "",
            operationId: operationIdNum ?? selectedOperation ?? "",
            specification: specification,
            value: value,
            officeId: Number(officeId),
            isActive: true,
            createdOn: new Date().toISOString(),
            createdBy: 0,
            updatedBy: 0,
            updatedOn: new Date().toISOString(),
          },
        ];
        await createConstruction(payload);
        alert("Construction data submitted successfully!");
      }

      // reset + refresh
      setOpenDialog(false);
      setIsEdit(false);
      setSelectedCDS(null);
      setSelectedInternalWO("");
      setSelectedOperation("");
      setSpecification("");
      setValue("");
      await loadConstructionData();
    } catch (error) {
      console.error("Error saving construction data:", error);
      alert("Failed to save construction data");
    }
  };

  // ---------- Inner table (local-only) ----------
  const handleInnerAddOperation = () => {
    if (selectedOperation && specification && value) {
      setOperationData((prev) => [
        ...prev,
        {
          id: Date.now(),
          operationName: selectedOperation, // storing id as "operationName" like your original code
          specification,
          value,
        },
      ]);
    }
  };

  const handleInnerDelete = (id) => {
    setOperationData((prev) => prev.filter((op) => op.id !== id));
  };

  const handleInnerEdit = (id) => {
    const item = operationData.find((op) => op.id === id);
    if (item) {
      setSelectedOperation(item.operationName);
      setSpecification(item.specification);
      setValue(item.value);
      setOperationData((prev) => prev.filter((op) => op.id !== id));
    }
  };

  const filteredWorkOrders =
    selectedWO && Array.isArray(workOrders)
      ? workOrders.filter((wo) => String(wo.woid) === String(selectedWO))
      : [];

  return (
    <div className="col-12">
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4">Construction Design Sheet</Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              // Fresh create flow
              setIsEdit(false);
              setSelectedCDS(null);
              setSelectedInternalWO("");
              setSelectedOperation("");
              setSpecification("");
              setValue("");
              setOpenDialog(true);
            }}
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
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {constructionData?.length > 0 ? (
                constructionData.map((row, index) => (
                  <TableRow key={row.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{row.internalWoid}</TableCell>
                    <TableCell>
                      {operations.find((op) => String(op.operationId) === String(row.operationId))
                        ?.operationName || "-"}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View">
                        <IconButton color="primary" onClick={() => handleViewCDS(row)}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                     
                      <Tooltip title="Delete">
                        <IconButton color="error" onClick={() => handleDeleteCDS(row)}>
                          <DeleteIcon />
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

      {/* Create/Edit Dialog (TOP) */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{isEdit ? "Edit Construction Design Sheet" : "Create Construction Design Sheet"}</DialogTitle>
        <DialogContent>
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
                const internalWO = internalWorkOrders.find((w) => String(w.id) === String(val));
                setSelectedWO(internalWO ? internalWO.woid : "");
                setProductDetailsMap({}); // reset products map
                loadWorkOrders(officeId);
              }}
              fullWidth
              sx={{ mt: 2 }}
            >
              <MenuItem value=""></MenuItem>
              {internalWorkOrders.map((wo) => (
                <MenuItem key={wo.id} value={wo.id}>
                  {`WO-${wo.woid} | Qty: ${wo.quantity} | Dispatch: ${wo.dispatchDate?.substring(0, 10)}`}
                </MenuItem>
              ))}
            </TextField>

            {/* Showing Products for Work Orders of selected Internal WO */}
            {/* <Box mt={2}>
              <Typography variant="subtitle1" gutterBottom>
                Products in Work Orders:
              </Typography>
              {filteredWorkOrders.length === 0 && <Typography>No work orders found.</Typography>}

              {filteredWorkOrders.map((wo) => (
                <Box key={wo.id} sx={{ mb: 2, p: 1, border: "1px solid #ccc", borderRadius: 1 }}>
                  <Typography fontWeight="bold">Work Order: {wo.name || wo.woid || wo.id}</Typography>

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
            </Box> */}
          </Stack>

          {/* INNER Table (local) */}
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
                        <IconButton color="primary" onClick={() => handleInnerEdit(row.id)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleInnerDelete(row.id)}>
                          <DeleteIcon />
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

              <TextField label="Value" value={value} onChange={(e) => setValue(e.target.value)} fullWidth />

              <Button variant="contained" color="primary" onClick={handleInnerAddOperation}>
                Create
              </Button>
            </Stack>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleSubmit}>
            {isEdit ? "Update" : "Submit All"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* VIEW Dialog (TOP) */}
      {/* VIEW Dialog (TOP) */}
{/* VIEW Dialog */}
<Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="md">
  <DialogTitle>View Construction Design Sheet</DialogTitle>
  <DialogContent>
    {selectedCDS && (
      <Stack spacing={2} mt={1}>
        <TextField
          label="Internal Work Order"
          value={selectedCDS.internalWoid}
          fullWidth
          disabled
        />
        <TextField
          label="Operation Name"
          value={
            operations.find((op) => String(op.operationId) === String(selectedCDS.operationId))
              ?.operationName || "-"
          }
          fullWidth
          disabled
        />

        {/* TABLE FOR SPECIFICATION & VALUE */}
        <Box mt={2}>
          <Typography variant="subtitle1">Operations</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Specification</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {viewOperationData.length > 0 ? (
                viewOperationData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <TextField
                        value={row.specification}
                        disabled={!row.isEdit}
                        onChange={(e) =>
                          setViewOperationData((prev) =>
                            prev.map((r) =>
                              r.id === row.id ? { ...r, specification: e.target.value } : r
                            )
                          )
                        }
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={row.value}
                        disabled={!row.isEdit}
                        onChange={(e) =>
                          setViewOperationData((prev) =>
                            prev.map((r) =>
                              r.id === row.id ? { ...r, value: e.target.value } : r
                            )
                          )
                        }
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      {!row.isEdit ? (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() =>
                            setViewOperationData((prev) =>
                              prev.map((r) => (r.id === row.id ? { ...r, isEdit: true } : r))
                            )
                          }
                        >
                          Edit
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={async () => {
                            try {
                              const payload = {
                                id: selectedCDS.id,
                                internalWoid: selectedCDS.internalWoid,
                                operationId: selectedCDS.operationId,
                                specification: row.specification,
                                value: row.value,
                                officeId: Number(officeId),
                                isActive: true,
                                updatedOn: new Date().toISOString(),
                                updatedBy: 0,
                              };
                              await updateConstructionDesignSheet(selectedCDS.id, payload);
                              alert("Row updated successfully!");
                              setViewOperationData((prev) =>
                                prev.map((r) =>
                                  r.id === row.id ? { ...r, isEdit: false } : r
                                )
                              );
                              await loadConstructionData();
                            } catch (err) {
                              console.error(err);
                              alert("Failed to update row");
                            }
                          }}
                        >
                          Save
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No operations found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </Stack>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setViewOpen(false)}>Close</Button>
  </DialogActions>
</Dialog>


    </div>
  );
};

export default ConstructionDesignSheet;
