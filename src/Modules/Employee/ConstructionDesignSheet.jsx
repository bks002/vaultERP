import React, { useEffect, useState, useMemo, use } from "react";
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
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import ViewIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import { useSelector } from "react-redux";
import { getOperationsByInternalWO } from "../../Services/OperationService.js";

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
import { getPartyMasters } from "../../Services/PartyMasterService.js";

// 🔹 Permanent default rows
const FIXED_ROWS = [
  { id: "temp-min-thickness", specification: "Min. Thickness", value: "", isFixed: true },
  { id: "temp-color", specification: "Color", value: "", isFixed: true },
];

const ConstructionDesignSheet = () => {
  const officeId = useSelector((state) => state.user.officeId);

  const [openDialog, setOpenDialog] = useState(false);
  const [viewopen, setViewOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [constructionData, setConstructionData] = useState([]);

  const [internalWorkOrders, setInternalWorkOrders] = useState([]);
  const [operations, setOperations] = useState([]);
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [productDetailsMap, setProductDetailsMap] = useState({});
  const [selectedWOData, setSelectedWOData] = useState([]);
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
  const [party, setParty] = useState([]);
  const [gradeCodes, setGradeCodes] = useState([]);
  const [selectedGradeCode, setSelectedGradeCode] = useState("");
  const [selectionMode, setSelectionMode] = useState("item"); // 'item' | 'grade'

  const [searchQuery, setSearchQuery] = useState("");

  // 🔸 Track baseline when an existing Grade Code is chosen. Used to decide if form changed.
  const [gradeBaseline, setGradeBaseline] = useState(null);

  const isExistingGrade = useMemo(
    () => !!selectedGradeCode && gradeCodes.map(String).includes(String(selectedGradeCode)),
    [selectedGradeCode, gradeCodes]
  );

  const isGradeDirty = useMemo(() => {
    if (!gradeBaseline) return false;
    const sameWO = String(gradeBaseline.internalWoid || "") === String(selectedInternalWO || "");
    const sameOp = String(gradeBaseline.operationId || "") === String(selectedOperation || "");
    const sameProd = String(gradeBaseline.productId || "") === String(selectedProduct || "");
    const sameItem = String(gradeBaseline.itemId || "") === String(selectedItem || "");

    const normalize = (arr) =>
      (arr || []).map((r) => ({ specification: r.specification, value: r.value, isFixed: !!r.isFixed }));

    const baselineSpecs = JSON.stringify(normalize(gradeBaseline.specValues || []));
    const currentSpecs = JSON.stringify(normalize(specValues || []));

    const specsSame = baselineSpecs === currentSpecs;

    return !(sameWO && sameOp && sameProd && sameItem && specsSame);
  }, [gradeBaseline, selectedInternalWO, selectedOperation, selectedProduct, selectedItem, specValues]);

  const canSubmit = useMemo(() => {
    if (selectionMode === "grade" && isExistingGrade && !isEdit) {
      // Only allow submit when something changed compared to the baseline snapshot
      return isGradeDirty;
    }
    // Otherwise allow submit (you may still want to check required fields in handleSubmit)
    return true;
  }, [selectionMode, isExistingGrade, isEdit, isGradeDirty]);

  // 🔹 Load grade codes
  useEffect(() => {
    const fetchGradeCodes = async () => {
      try {
        const data = await getConstructionDesignSheets(officeId);
        const uniqueCodes = [...new Set(data.map((item) => item.gradecode).filter(Boolean))];
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
            loadItems(),
            loadConstructionData(),
            loadParty(),
          ]);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [officeId]);

  const loadParty = async () => {
    try {
      const data = await getPartyMasters(officeId);
      console.log(data);
      setParty(data || []);
    } catch (err) {
      console.error("Failed to fetch Party:", err.message);
    }
  };

  const loadConstructionData = async () => {
    try {
      const data = await getConstructionDesignSheets(officeId);
      setConstructionData(data || []);
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
        setProductDetailsMap((prev) => ({ ...prev, ...map }));
      }
    } catch (err) {
      console.error("Failed to fetch products:", err.message);
    }
  };

  const loadOperationsByInternalWO = async (inwoId) => {
    try {
      if (!inwoId) {
        setOperations([]);
        return;
      }
      const data = await getOperationsByInternalWO(inwoId);
      setOperations(data || []);
    } catch (err) {
      console.error("Failed to fetch operations:", err.message);
    }
  };
  // ---------- Add Spec ----------
  const handleAddSpecValue = async () => {
    if (tempSpec.trim() && tempValue.trim()) {
      const finalSpec = tempSpec.trim();

      const exists = specValues.some(
        (row) => row.specification.toLowerCase() === finalSpec.toLowerCase()
      );
      if (exists) {
        alert("⚠️ This specification is already added.");
        return;
      }

      try {
        const found = specificationOptions.find(
          (s) => s.toLowerCase() === finalSpec.toLowerCase()
        );
        if (!found) {
          await createSpecification(finalSpec);
          const updatedSpecs = await getAllSpecifications();
          setSpecificationOptions(updatedSpecs.map((s) => s.specificationName));
        }

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
      const fixedMin = row.items.find(it => it.specification?.toLowerCase() === "min. thickness");
      const fixedColor = row.items.find(it => it.specification?.toLowerCase() === "color");
      const others = row.items.filter(it => !["min. thickness", "color"].includes(it.specification?.toLowerCase()));

      setSpecValues([
        fixedMin ? { ...fixedMin, specification: "Min. Thickness", isFixed: true } : FIXED_ROWS[0],
        fixedColor ? { ...fixedColor, specification: "Color", isFixed: true } : FIXED_ROWS[1],
        ...others.map(it => ({ id: it.id, specification: it.specification, value: it.value })),
      ]);
    } else {
      setSpecValues(FIXED_ROWS);
    }

    setOpenDialog(true);
  };

  const resetForm = () => {
    setOpenDialog(false);
    setIsEdit(false);
    setSelectedCDS(null);
    setSelectedInternalWO("");
    setSelectedOperation("");
    setSelectedProduct("");
    setSelectedItem("");
    setSelectedGradeCode("");
    setSpecValues([]);
    setGradeBaseline(null);
  };
  const handleSubmit = async () => {
    try {
      if (selectionMode === "grade" && isExistingGrade && !isEdit && !isGradeDirty) {
        alert("Select a Grade Code and then change Internal WO / Operation / Product or modify Specifications before submitting.");
        return;
      }

      const internalWoidId = Number(selectedInternalWO) || 0;
      const operationIdNum = Number(selectedOperation) || 0;
      const productIdNum = Number(selectedProduct) || 0;

      let itemIdNum = 0;

      if (selectionMode === "item") {
        itemIdNum = Number(selectedItem) || 0;
      } else if (selectionMode === "grade" && selectedGradeCode) {
        // 🔹 If existing grade code, keep the original itemId; if new, keep current or 0.
        const allCDS = await getConstructionDesignSheets(officeId);
        const cds = allCDS.find((cd) => cd.gradecode === selectedGradeCode);
        itemIdNum = cds?.itemId ? Number(cds.itemId) : Number(selectedItem) || 0;
      }

      const now = new Date().toISOString();
      const payload = specValues.map((sv) => ({
        id: String(sv.id).startsWith("temp") ? 0 : Number(sv.id),
        internalWoid: internalWoidId,
        operationId: operationIdNum,
        productId: productIdNum,
        itemId: itemIdNum,
        specification: sv.specification,
        value: sv.value,
        gradecode: selectedGradeCode || "",
        officeId: Number(officeId),
        isActive: true,
        createdOn: now,
        createdBy: 0,
        updatedBy: 0,
        updatedOn: now,
      }));

      if (isEdit && selectedCDS) {
        await updateConstructionDesignSheet(internalWoidId, payload);
        alert("Updated successfully!");
      } else {
        await createConstruction(payload);
        alert("Created successfully!");
      }

      resetForm();
      await loadConstructionData();
    } catch (error) {
      console.error("Error saving:", error);
      alert("Failed to save data");
    }
  };

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

  const handleInternalWOChange = (id) => {
    setSelectedInternalWO(id);
    setSelectedProduct("");
    const filteredData = internalWorkOrders.filter((wo) => wo.id === id);
    setSelectedWOData(filteredData);

    loadProductsByInternalWO(id);
    loadOperationsByInternalWO(id);   // 🔹 now loads ops specific to WO
  };

  // --- Helpers ---
  const handleSelectGradeCode = async (grade) => {
    setSelectedGradeCode(grade || "");

    if (!grade) {
      // New/empty grade code: clear fields but keep fixed rows
      setSelectedInternalWO("");
      setSelectedOperation("");
      setSelectedProduct("");
      setSelectedItem("");
      setSpecValues(FIXED_ROWS);
      setGradeBaseline(null);
      return;
    }

    const cds = constructionData.find((cd) => cd.gradecode === grade);
    if (cds) {
      setSelectedInternalWO(cds.internalWoid || "");
      setSelectedOperation(cds.operationId || "");
      setSelectedProduct(cds.productId || "");
      setSelectedItem(cds.itemId || "");

      // ensure products are loaded for this internal WO
      await loadProductsByInternalWO(cds.internalWoid);

      if (cds.items && cds.items.length > 0) {
        const fixedMin = cds.items.find((it) => it.specification?.toLowerCase() === "min. thickness");
        const fixedColor = cds.items.find((it) => it.specification?.toLowerCase() === "color");
        const others = cds.items.filter(
          (it) => !["min. thickness", "color"].includes(it.specification?.toLowerCase())
        );

        const nextSpecs = [
          fixedMin ? { ...fixedMin, specification: "Min. Thickness", isFixed: true } : FIXED_ROWS[0],
          fixedColor ? { ...fixedColor, specification: "Color", isFixed: true } : FIXED_ROWS[1],
          ...others.map((it) => ({ id: it.id, specification: it.specification, value: it.value })),
        ];
        setSpecValues(nextSpecs);

        // Snapshot baseline for change detection
        setGradeBaseline({
          internalWoid: cds.internalWoid || "",
          operationId: cds.operationId || "",
          productId: cds.productId || "",
          itemId: cds.itemId || "",
          specValues: nextSpecs,
        });
      } else {
        setSpecValues(FIXED_ROWS);
        setGradeBaseline({
          internalWoid: cds.internalWoid || "",
          operationId: cds.operationId || "",
          productId: cds.productId || "",
          itemId: cds.itemId || "",
          specValues: FIXED_ROWS,
        });
      }
    } else {
      // New grade code entered manually (freeSolo)
      setSelectedInternalWO("");
      setSelectedOperation("");
      setSelectedProduct("");
      setSelectedItem("");
      setSpecValues(FIXED_ROWS);
      setGradeBaseline(null);
    }
  };

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
              setSelectedGradeCode("");
              setSpecValues(FIXED_ROWS);
              setSelectionMode("item");
              setGradeBaseline(null);
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
            <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
              {/* Dropdown */}
              <TextField
                select
                label="Internal Work Order"
                value={selectedInternalWO}
                onChange={(e) => handleInternalWOChange(e.target.value)}
                size="small"
                sx={{ minWidth: 100 }}
                InputProps={{
                  sx: {
                    height: 70,
                    display: "flex",
                    alignItems: "center",
                  },
                }}
              >
                <MenuItem value=""></MenuItem>
                {internalWorkOrders.map((wo) => (
                  <MenuItem key={wo.id} value={wo.id}>
                    {wo.id}
                  </MenuItem>
                ))}
              </TextField>

              {/* Table */}
              {selectedWOData.length > 0 && (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Work Order ID</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Dispatch Date</TableCell>
                      <TableCell>Delivery Date</TableCell>
                      <TableCell>Total Deliverable</TableCell>
                      <TableCell>Board Name</TableCell>
                      <TableCell>Party Name</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedWOData.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.woid}</TableCell>
                        <TableCell>{row.quantity}</TableCell>
                        <TableCell>{new Date(row.dispatchDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(row.deliveryDate).toLocaleDateString()}</TableCell>
                        <TableCell>{row.totalDeliverable}</TableCell>
                        <TableCell>{row.boardName}</TableCell>
                        <TableCell>
                          {party.find(p => p.id === row.partyId)?.name || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>
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
            <FormControl component="fieldset" sx={{ mt: 1 }}>
              <FormLabel component="legend">Select By</FormLabel>
              <RadioGroup
                row
                value={selectionMode}
                onChange={(e) => {
                  const mode = e.target.value;
                  setSelectionMode(mode);
                  setSelectedItem("");
                  setSelectedGradeCode("");
                  setSpecValues(FIXED_ROWS);
                  setGradeBaseline(null);
                }}
              >
                <FormControlLabel value="item" control={<Radio />} label="Item" />
                <FormControlLabel value="grade" control={<Radio />} label="Grade Code" />
              </RadioGroup>
            </FormControl>

            {selectionMode === "item" ? (
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
            ) : (
              // 🔹 Single Grade Code control (no duplicates). FreeSolo allows new code entry.
              <Autocomplete
                freeSolo
                options={gradeCodes}
                value={selectedGradeCode}
                onChange={(e, newValue) => handleSelectGradeCode(newValue || "")}
                onInputChange={(e, newInput) => setSelectedGradeCode(newInput || "")}
                renderInput={(params) => (
                  <TextField {...params} label="Grade Code" placeholder="Select or type new" />
                )}
              />
            )}

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
                options={specificationOptions}
                value={tempSpec}
                onChange={(e, newValue) => setTempSpec(newValue || "")}
                onInputChange={(e, newInputValue) => setTempSpec(newInputValue || "")}
                renderInput={(params) => (
                  <TextField {...params} label="Specification" fullWidth />
                )}
                sx={{ flex: 1 }}
              />
              <TextField
                label="Value"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                sx={{ flex: 1 }}
              />

              <Button variant="contained" onClick={handleAddSpecValue}>
                Add
              </Button>
            </Stack>

            <Table size="small" sx={{ mt: 2 }}>
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
                        fullWidth
                        value={row.value}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          setSpecValues((prev) =>
                            prev.map((r) => (r.id === row.id ? { ...r, value: newValue } : r))
                          );
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {!row.isFixed && (
                        <IconButton color="error" onClick={() => handleRemoveSpecValue(row.id)}>
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isEdit ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewopen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>View Technical Specification</DialogTitle>
        <DialogContent>
          {selectedCDS ? (
            <Box>
              <Typography><b>Internal Work Order:</b> {selectedCDS.internalWoid}</Typography>
              <Typography><b>Product:</b> {productDetailsMap[selectedCDS.productId] || "-"}</Typography>
              <Typography>
                <b>Operation:</b>{" "}
                {operations.find((op) => String(op.operationId) === String(selectedCDS.operationId))?.operationName || "-"}
              </Typography>
              <Typography>
                <b>Item:</b>{" "}
                {items.find((it) => String(it.id) === String(selectedCDS.itemId))?.name || "-"}
              </Typography>
              <Typography><b>Grade Code:</b> {selectedCDS.gradecode || "-"}</Typography>

              <Table size="small" sx={{ mt: 2 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Specification</TableCell>
                    <TableCell>Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedCDS.items?.length ? (
                    selectedCDS.items.map((it) => (
                      <TableRow key={it.id}>
                        <TableCell>{it.specification}</TableCell>
                        <TableCell>{it.value}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} align="center">
                        No specifications found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          ) : (
            <Typography>No data</Typography>
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