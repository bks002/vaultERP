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
  InputAdornment,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";

import ViewIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useSelector } from "react-redux";

import { getAllOperation } from "../../Services/OperationService.js";
import {
  getInternalWorkOrdersByOffice,
  getInternalWorkOrderProduct,
} from "../../Services/InternalWorkOrderService.js";
import { getProductByID } from "../../Services/ProductMasterService.js";
import { getAllItems } from "../../Services/InventoryService.jsx";
import {
  getConstructionDesignSheets,
  createConstruction,
  updateConstructionDesignSheet,
  deleteConstructionDesignSheet,
  getAllSpecifications,
  createSpecification,
} from "../../Services/ConstructionDesignSheet.js";
import ExportCSVButton from "../../Components/Export to CSV/ExportCSVButton";
import SearchIcon from "@mui/icons-material/Search";

// 🔹 Permanent default row
const FIXED_ROW = {
  id: "temp-min-thickness", // unique temporary id
  specification: "Min. Thickness",
  value: "",
};

const ConstructionDesignSheet = () => {
  const officeId = useSelector((state) => state.user.officeId);

  const [openDialog, setOpenDialog] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [constructionData, setConstructionData] = useState([]);
  const [internalWorkOrders, setInternalWorkOrders] = useState([]);
  const [operations, setOperations] = useState([]);
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [productDetailsMap, setProductDetailsMap] = useState({});

  const [selectedItem, setSelectedItem] = useState("");
  const [selectedInternalWO, setSelectedInternalWO] = useState("");
  const [selectedOperation, setSelectedOperation] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");

  const [isEdit, setIsEdit] = useState(false);
  const [selectedCDS, setSelectedCDS] = useState(null);

  const [specificationOptions, setSpecificationOptions] = useState([]);
  const [specValues, setSpecValues] = useState([]);
  const [tempSpec, setTempSpec] = useState("");
  const [tempValue, setTempValue] = useState("");

  const [gradeCodes, setGradeCodes] = useState([]);
  const [selectedGradeCode, setSelectedGradeCode] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  // 🔹 Load grade codes
  useEffect(() => {
    const fetchGradeCodes = async () => {
      try {
        const data = await getConstructionDesignSheets(officeId);
        const uniqueCodes = [...new Set(data.map((item) => item.gradecode))];
        setGradeCodes(uniqueCodes);
      } catch (err) {
        console.error("Failed to load grade codes:", err);
      }
    };
    fetchGradeCodes();
  }, [officeId]);

  // 🔹 Load specification master list
  useEffect(() => {
    (async () => {
      try {
        const specs = await getAllSpecifications();
        setSpecificationOptions(specs.map((s) => s.specificationName));
      } catch (err) {
        console.error("Failed to load specifications:", err);
      }
    })();
  }, []);

  // 🔹 Load base data
  useEffect(() => {
    if (Number(officeId) > 0) {
      (async () => {
        setLoading(true);
        try {
          await Promise.all([
            loadInternalWorkOrders(),
            loadOperations(),
            loadItems(),
            loadConstructionData(),
          ]);
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

      // Build product map
      const allProductIds = Array.from(
        new Set((data || []).map((d) => d.productId).filter(Boolean))
      );
      if (allProductIds.length) {
        const allProductsData = await Promise.all(
          allProductIds.map((id) => getProductByID(id))
        );
        let productArray = allProductsData.flatMap((p) =>
          Array.isArray(p) ? p : p?.data ? p.data : [p]
        );
        const map = {};
        productArray.forEach((p) => {
          map[p.id] = p.name || p.product_name;
        });
        setProductDetailsMap(map);
      }
    } catch (err) {
      console.error("Error fetching construction data:", err.message);
    }
  };

  const loadItems = async () => {
    try {
      const data = await getAllItems(officeId);
      setItems(data || []);
    } catch (err) {
      console.error("Failed to fetch items:", err.message);
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

  const loadProductsByInternalWO = async (inwoId) => {
    try {
      if (!inwoId) {
        setProducts([]);
        setProductDetailsMap({});
        return;
      }
      const productIds = await getInternalWorkOrderProduct(inwoId);
      if (productIds?.length) {
        const productData = await Promise.all(
          productIds.map((id) => getProductByID(id))
        );
        let productArray = productData.flatMap((p) =>
          Array.isArray(p) ? p : p?.data ? p.data : [p]
        );
        setProducts(productArray);
        const map = {};
        productArray.forEach((p) => {
          map[p.id] = p.name || p.product_name;
        });
        setProductDetailsMap(map);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err.message);
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

  // ---------- Add Spec ----------
  const handleAddSpecValue = async () => {
    if (tempSpec.trim() && tempValue.trim()) {
      const finalSpec = tempSpec.trim();

      // Prevent duplicates in current table
      const exists = specValues.some(
        (row) => row.specification.toLowerCase() === finalSpec.toLowerCase()
      );
      if (exists) {
        alert("⚠️ This specification is already added.");
        return;
      }

      try {
        // Save to backend if new
        const found = specificationOptions.find(
          (s) => s.toLowerCase() === finalSpec.toLowerCase()
        );
        if (!found) {
          await createSpecification(finalSpec);
          const updatedSpecs = await getAllSpecifications();
          setSpecificationOptions(updatedSpecs.map((s) => s.specificationName));
        }

        // Add locally
        setSpecValues((prev) => [
          ...prev,
          { id: "temp-" + Date.now(), specification: finalSpec, value: tempValue.trim() },
        ]);

        setTempSpec("");
        setTempValue("");
      } catch (err) {
        console.error("Error saving spec:", err);
      }
    }
  };

  const handleRemoveSpecValue = (id) => {
    setSpecValues((prev) => prev.filter((row) => row.id !== id));
  };

  // ---------- CRUD actions ----------
  const handleViewCDS = (row) => {
    setSelectedCDS(row);
    setViewOpen(true);
  };

  const handleDeleteCDS = async (row) => {
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

  const handleEditCDS = async (row) => {
    setIsEdit(true);
    setSelectedCDS(row);
    setSelectedInternalWO(row.internalWoid || "");
    setSelectedOperation(row.operationId || "");
    setSelectedProduct(row.productId || "");
    setSelectedItem(row.itemId || "");
    setSelectedGradeCode(row.gradecode || "");

    if (row.items && row.items.length > 0) {
      const fixedItem = row.items.find(
        (it) => it.specification?.toLowerCase() === "min. thickness"
      );
      const others = row.items.filter(
        (it) => it.specification?.toLowerCase() !== "min. thickness"
      );
      setSpecValues([
        fixedItem
          ? { id: fixedItem.id, specification: "Min. Thickness", value: fixedItem.value }
          : FIXED_ROW,
        ...others.map((it) => ({
          id: it.id,
          specification: it.specification,
          value: it.value,
        })),
      ]);
    } else {
      setSpecValues([FIXED_ROW]);
    }
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    try {
      const internalWoidId = Number(selectedInternalWO) || 0;
      const operationIdNum = Number(selectedOperation) || 0;
      const productIdNum = Number(selectedProduct) || 0;
      const itemIdNum = Number(selectedItem) || 0;

      const payload = specValues.map((sv) => ({
        id: String(sv.id).startsWith("temp") ? 0 : Number(sv.id),
        internalWoid: internalWoidId,   // must match URL param
        operationId: operationIdNum,
        productId: productIdNum,
        itemId: itemIdNum,
        specification: sv.specification,
        value: sv.value,
        officeId: Number(officeId),
        isActive: true,
        createdOn: new Date().toISOString(),
        createdBy: 0,
        updatedBy: 0,
        updatedOn: new Date().toISOString(),
        ...(selectedGradeCode && { gradecode: selectedGradeCode }),
      }));

      if (isEdit && selectedCDS) {
        await updateConstructionDesignSheet(internalWoidId, payload);
        alert("Updated successfully!");
      } else {
        await createConstruction(payload);
        alert("Created successfully!");
      }

      // Reset
      setOpenDialog(false);
      setIsEdit(false);
      setSelectedCDS(null);
      setSelectedInternalWO("");
      setSelectedOperation("");
      setSelectedProduct("");
      setSelectedItem("");
      setSpecValues([]);
      await loadConstructionData();
    } catch (error) {
      console.error("Error saving:", error);
      alert("Failed to save data");
    }
  };

  // ---------- Filtered Data ----------
  const filteredConstructionData = constructionData.filter((row) => {
    const productName = productDetailsMap[row.productId] || "";
    const operationName =
      operations.find((op) => String(op.operationId) === String(row.operationId))
        ?.operationName || "";
    return (
      String(row.internalWoid).toLowerCase().includes(searchQuery.toLowerCase()) ||
      productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      operationName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // ---------- Render ----------
  return (
    <div className="col-12">
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4">Technical Specification</Typography>
        <TextField
          placeholder="Search by Internal WO, Product, Operation"
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
        <Box display="flex" alignItems="center" gap={2}>
          <ExportCSVButton
            data={filteredConstructionData}
            filename="ConstructionDesignSheets.csv"
            headers={[
              { label: "Internal Work Order", key: "internalWoid" },
              { label: "Product", key: "productId" },
              { label: "Operation", key: "operationId" },
              { label: "Item", key: "itemId" },
              { label: "Specifications", key: "specification" },
              { label: "Value", key: "value" },
            ]}
          />
          <Button
            variant="contained"
            onClick={() => {
              setIsEdit(false);
              setSelectedCDS(null);
              setSelectedInternalWO("");
              setSelectedOperation("");
              setSelectedProduct("");
              setSelectedItem("");
              setSpecValues([FIXED_ROW]);
              setOpenDialog(true);
            }}
          >
            Create Technical Specification
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Internal Work Order</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Operation</TableCell>
                <TableCell>Item</TableCell>
                <TableCell>Grade Code</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredConstructionData.length > 0 ? (
                filteredConstructionData.map((row, idx) => (
                  <TableRow key={row.id}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{row.internalWoid}</TableCell>
                    <TableCell>{productDetailsMap[row.productId] || "-"}</TableCell>
                    <TableCell>
                      {operations.find((op) => String(op.operationId) === String(row.operationId))
                        ?.operationName || "-"}
                    </TableCell>
                    <TableCell>
                      {items.find((it) => String(it.id) === String(row.itemId))?.name || "-"}
                    </TableCell>
                    <TableCell>{row.gradecode || "-"}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="View">
                        <IconButton onClick={() => handleViewCDS(row)}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleEditCDS(row)}>
                          <EditIcon />
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
                  <TableCell colSpan={7} align="center">
                    No data found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{isEdit ? "Edit" : "Create"} Technical Specification</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              select
              label="Internal Work Order"
              value={selectedInternalWO}
              onChange={(e) => {
                setSelectedInternalWO(e.target.value);
                setSelectedProduct("");
                loadProductsByInternalWO(e.target.value);
              }}
            >
              <MenuItem value=""></MenuItem>
              {internalWorkOrders.map((wo) => (
                <MenuItem key={wo.id} value={wo.id}>
                  {wo.id}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Product"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              <MenuItem value="">Select Product</MenuItem>
              {products.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {productDetailsMap[p.id] || p.name || p.product_name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Item"
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
            >
              <MenuItem value="">Select Item</MenuItem>
              {items.map((it) => (
                <MenuItem key={it.id} value={it.id}>
                  {it.name || it.itemName}
                </MenuItem>
              ))}
            </TextField>

            {isEdit && (
              <TextField label="Grade Code" value={selectedGradeCode} fullWidth disabled />
            )}

            <TextField
              select
              label="Operation"
              value={selectedOperation}
              onChange={(e) => setSelectedOperation(e.target.value)}
            >
              {operations.map((op) => (
                <MenuItem key={op.operationId} value={op.operationId}>
                  {op.operationName}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          {/* Specification & Value Add Section */}
          <Box mt={3}>
            <Stack direction="row" spacing={2}>
              <Autocomplete
                freeSolo
                options={specificationOptions} // ✅ master list from API
                value={tempSpec}
                onChange={(e, newValue) => setTempSpec(newValue || "")}
                onInputChange={(e, newInputValue) => setTempSpec(newInputValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Specification" fullWidth />
                )}
                sx={{ flex: 1 }}
              />



              <TextField
                label="Value"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                fullWidth
                sx={{ flex: 1 }}   // ✅ Equal width
              />
              <Button variant="contained" onClick={handleAddSpecValue}>
                Add
              </Button>
            </Stack>
          </Box>

          {/* Table of added spec-values */}
          {specValues.length > 0 && (
            <Box mt={2}>
              <Typography variant="subtitle1">Specification & Values</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Specification</TableCell>
                    <TableCell>Value</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {specValues.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.specification}</TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          fullWidth
                          value={row.value}
                          sx={{ width: 150 }}
                          onChange={(e) =>
                            setSpecValues((prev) =>
                              prev.map((r) =>
                                r.id === row.id ? { ...r, value: e.target.value } : r
                              )
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {!row.isFixed && ( // 🚫 Hide delete for fixed row
                          <Button
                            color="error"
                            size="small"
                            onClick={() => handleRemoveSpecValue(row.id)}
                          >
                            Delete
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>

              </Table>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleSubmit}>
            {isEdit ? "Update" : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* VIEW Dialog */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>View Technical Specification</DialogTitle>
        <DialogContent>
          {selectedCDS && (
            <Stack spacing={2} mt={1}>
              <TextField label="Internal Work Order" value={selectedCDS.internalWoid} fullWidth disabled />
              <TextField
                label="Product"
                value={productDetailsMap[selectedCDS.productId] || "-"}
                fullWidth
                disabled
              />
              <TextField
                label="Operation"
                value={
                  operations.find((op) => String(op.operationId) === String(selectedCDS.operationId))
                    ?.operationName || "-"
                }
                fullWidth
                disabled
              />
              <TextField
                label="Item"
                value={
                  items.find((item) => String(item.id) === String(selectedCDS.itemId))
                    ?.name || "-"
                }
                fullWidth
                disabled
              />
              <Box mt={2}>
                <Typography variant="subtitle1">Specification & Value</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Specification</TableCell>
                      <TableCell>Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedCDS.items?.map((it) => (
                      <TableRow key={it.id}>
                        <TableCell>{it.specification}</TableCell>
                        <TableCell>{it.value}</TableCell>
                      </TableRow>
                    ))}
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
