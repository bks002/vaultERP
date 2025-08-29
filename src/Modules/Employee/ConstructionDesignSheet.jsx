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
import { getInternalWorkOrdersByOffice, getInternalWorkOrderProduct } from "../../Services/InternalWorkOrderService.js";
import { getProductByID } from "../../Services/ProductMasterService.js";
import { getAllItems } from "../../Services/InventoryService.jsx";
import {
  getConstructionDesignSheets,
  createConstruction,
  updateConstructionDesignSheet,
  deleteConstructionDesignSheet,
  getAllSpecifications, createSpecification
} from "../../Services/ConstructionDesignSheet.js";
import ExportCSVButton from '../../Components/Export to CSV/ExportCSVButton';
import SearchIcon from '@mui/icons-material/Search';

// 🔹 Permanent row definition (always in table)
const FIXED_ROW = {
  id: "fixed-min-thickness",
  specification: "Min. Thickness",
  value: "",
  isFixed: true,
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


  const [selectedItem, setSelectedItem] = useState("");
  const [selectedInternalWO, setSelectedInternalWO] = useState("");
  const [selectedOperation, setSelectedOperation] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [specification, setSpecification] = useState("");
  const [value, setValue] = useState("");


  const [productDetailsMap, setProductDetailsMap] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [selectedCDS, setSelectedCDS] = useState(null);

const [specificationOptions, setSpecificationOptions] = useState([]);
  const [viewOperationData, setViewOperationData] = useState([]);

  const [specValues, setSpecValues] = useState([]);
  const [tempSpec, setTempSpec] = useState("");
  const [tempValue, setTempValue] = useState("");
  const [specifications, setSpecifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [newSpecName, setNewSpecName] = useState("");
  const [gradeCodes, setGradeCodes] = useState([]);
const [selectedGradeCode, setSelectedGradeCode] = useState("");



// Load unique grade codes from Constructions API
useEffect(() => {
  const fetchGradeCodes = async () => {
    try {
      const data = await getConstructionDesignSheets(officeId); // existing API
      const uniqueCodes = [...new Set(data.map(item => item.gradecode))];
      setGradeCodes(uniqueCodes);
    } catch (err) {
      console.error("Failed to load grade codes:", err);
    }
  };
  fetchGradeCodes();
}, [officeId]);
  // 🔹 Load specifications from API
  useEffect(() => {
    loadSpecifications();
  }, []);

  const loadSpecifications = async () => {
    try {
      const specs = await getAllSpecifications();

      // Map API data to table rows
      const mapped = specs.map((s) => ({
        ...s,
        value: "",
        isFixed: false,
      }));

      // Always include FIXED_ROW at top
      setSpecifications([FIXED_ROW, ...mapped]);
    } catch (err) {
      console.error("Failed to load specifications:", err);
    }
  };

  

  const generateGradeCode = () => {
  const prefix = "AUTO"; // prefix अपनी requirement के हिसाब से बदलें
  const random = Math.floor(100 + Math.random() * 900); // 3 digit random number
  return `${prefix}${random}`;
};


const handleAddSpecValue = async () => {
  if (tempSpec.trim() && tempValue.trim()) {
    const finalSpec = tempSpec.trim();

    try {
      // ✅ Check if spec already exists in dropdown (case-insensitive)
      const existing = specificationOptions.find(
        (s) =>
          (typeof s === "string"
            ? s.toLowerCase()
            : s?.specificationName?.toLowerCase()) === finalSpec.toLowerCase()
      );

      if (!existing) {
        // ✅ Save to backend if completely new
        await createSpecification(finalSpec);

        // ✅ Reload master list from API (fresh copy)
        const updatedSpecs = await getAllSpecifications();
        setSpecificationOptions(updatedSpecs.map((s) => s.specificationName));
      } else {
        // ⚠️ If exists, always use the original casing (like "Fruit")
        const properCase =
          typeof existing === "string"
            ? existing
            : existing?.specificationName || finalSpec;

        // ✅ Avoid saving duplicate in master, but allow adding to local CDS table with correct case
        setSpecValues((prev) => [
          ...prev,
          { id: Date.now(), specification: properCase, value: tempValue.trim() },
        ]);

        setTempSpec("");
        setTempValue("");
        return;
      }

      // ✅ Add to local CDS list with finalSpec
      setSpecValues((prev) => [
        ...prev,
        { id: Date.now(), specification: finalSpec, value: tempValue.trim() },
      ]);

      // Reset input fields
      setTempSpec("");
      setTempValue("");
    } catch (err) {
      console.error(
        "Error saving specification:",
        err.response?.data || err.message
      );
      alert("Failed to save specification. Check API payload.");
    }
  }
};






  const handleRemoveSpecValue = (id) => {
  if (id === "fixed-min-thickness") return; // 🚫 don't remove fixed row
  setSpecValues((prev) => prev.filter((row) => row.id !== id));
};


// Load all specifications on mount
useEffect(() => {
  (async () => {
    const specs = await getAllSpecifications();
    setSpecificationOptions(specs.map(s => s.specificationName));
  })();
}, []);


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

      // Build a unique list of product IDs used in constructionData
      const allProductIds = Array.from(
        new Set(
          (data || [])
            .map(d => d.productId)
            .filter(Boolean)
        )
      );

      if (allProductIds.length) {
        // Fetch all products by ID
        const allProductsData = await Promise.all(allProductIds.map(id => getProductByID(id)));

        // Normalize product array
        let productArray = [];
        if (Array.isArray(allProductsData)) {
          productArray = allProductsData.flatMap(p => {
            if (Array.isArray(p)) return p;
            if (p && p.data) return p.data;
            return p ? [p] : [];
          });
        }

        // Build a global product map
        const map = {};
        productArray.forEach(p => {
          map[p.id] = p.name || p.product_name;
        });
        setProductDetailsMap(map);
      } else {
        setProductDetailsMap({});
      }

    } catch (err) {
      console.error("Error fetching construction design sheets:", err.message);
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
        let productArray = [];
        if (Array.isArray(productData)) {
          productArray = productData;
        } else if (productData && productData.data && Array.isArray(productData.data)) {
          productArray = productData.data;
        } else if (productData) {
          productArray = [productData];
        }

        setProducts(productArray);

        const productMap = {};
        productArray.forEach((p) => {
          productMap[p.id] = p.name;
        });
        setProductDetailsMap(productMap);

      } else {
        setProducts([]);
        setProductDetailsMap({});
      }
    } catch (err) {
      console.error("Failed to fetch products:", err.message);
      setProducts([]);
      setProductDetailsMap({});
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

  // ---------- Top table actions ----------
  const handleViewCDS = (row) => {
    setSelectedCDS(row);
    setViewOperationData([
      {
        id: Date.now(),
        specification: row.specification,
        value: row.value,
      },
    ]);
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

    const internalWOId = row.internalWoid || "";
    setSelectedInternalWO(internalWOId);
    setSelectedOperation(row.operationId || "");
    setSelectedProduct(row.productId || "");
    setSelectedItem(row.itemId || "");

    // Load products for this Internal WO
    if (internalWOId) {
      try {
        const productIds = await getInternalWorkOrderProduct(internalWOId);
        if (productIds?.length) {
          const productData = await Promise.all(productIds.map((id) => getProductByID(id)));
          let productArray = [];
          if (Array.isArray(productData)) {
            productArray = productData.flatMap(p => {
              if (Array.isArray(p)) return p;
              if (p && p.data) return p.data;
              return p ? [p] : [];
            });
          }

          setProducts(productArray);

          const productMap = {};
          productArray.forEach((p) => {
            productMap[p.id] = p.name || p.product_name;
          });
          setProductDetailsMap(productMap);
        }
      } catch (err) {
        console.error("Failed to fetch products for edit:", err.message);
        setProducts([]);
        setProductDetailsMap({});
      }
    }

    // For multiple specs
if (row.items && row.items.length > 0) {
  setSpecValues([
    FIXED_ROW, // ✅ always include fixed row
    ...row.items.map((it) => ({
      id: it.id,
      specification: it.specification,
      value: it.value,
    })),
  ]);
} else {
  setSpecValues([
    FIXED_ROW,
    {
      id: row.id,
      specification: row.specification,
      value: row.value,
    },
  ]);
}


    setOpenDialog(true);
  };


  
  // ---------- Create / Update submit ----------
  const handleSubmit = async () => {
    try {
      const internalWoidId = selectedInternalWO ? Number(selectedInternalWO) : 0;
      const operationIdNum = selectedOperation ? Number(selectedOperation) : 0;
      const productIdNum = selectedProduct ? Number(selectedProduct) : 0;
      const itemIdNum = selectedItem ? Number(selectedItem) : 0;

      // Build array for API
      const payload = specValues.map((sv) => ({
        id: sv ? sv.id : 0,
        internalWoid: internalWoidId,
        operationId: operationIdNum,
        productId: productIdNum,
        itemId: itemIdNum,
        specification: sv.specification,
        value: sv.value,
        gradecode: selectedGradeCode || generateGradeCode(),
        officeId: Number(officeId),
        isActive: true,
        createdOn: new Date().toISOString(),
        createdBy: 0,
        updatedBy: 0,
        updatedOn: new Date().toISOString(),
      }));

      if (selectedCDS) {
        console.log(payload);
        // Update (PUT) - still array if your API expects it
        await updateConstructionDesignSheet(internalWoidId, payload);
        alert("Construction data updated successfully!");
      } else {
        // Create (POST)
        await createConstruction(payload);
        alert("Construction data submitted successfully!");
      }

      // Reset form
      setOpenDialog(false);
      setIsEdit(false);
      setSelectedCDS(null);
      setSelectedInternalWO("");
      setSelectedOperation("");
      setSelectedProduct("");
      setSpecValues([]);
      setTempSpec("");
      setTempValue("");
      setValue("");
      await loadConstructionData();
    } catch (error) {
      console.error("Error saving construction data:", error);
      alert("Failed to save construction data");
    }
  };

  const [searchQuery, setSearchQuery] = useState('');

  // Filtered construction data based on search
  const filteredConstructionData = constructionData.filter((row) => {
    const productName = productDetailsMap[row.productId] || '';
    const operationName =
      operations.find((op) => String(op.operationId) === String(row.operationId))?.operationName || '';
    return (
      String(row.internalWoid).toLowerCase().includes(searchQuery.toLowerCase()) ||
      productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      operationName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // CSV headers
  const csvHeaders = [
    { label: 'Internal Work Order', key: 'internalWoid' },
    { label: 'Product', key: 'productId' }, // We'll map IDs to names in data
    { label: 'Operation', key: 'operationId' }, // Map IDs to names
    { label: 'Item', key: 'itemId' },
    { label: 'Specifications', key: 'specification' },
    { label: 'Value', key: 'value' }
  ];

  // CSV data mapping
  const csvData = filteredConstructionData.map(row => ({
    ...row,
    productId: productDetailsMap[row.productId] || '',
    operationId:
      operations.find((op) => String(op.operationId) === String(row.operationId))?.operationName || ''
  }));

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
            data={csvData}
            filename="ConstructionDesignSheets.csv"
            headers={csvHeaders}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setIsEdit(false);
              setSelectedCDS(null);
              setSelectedInternalWO("");
              setSelectedOperation("");
              setSelectedProduct("");
              setSpecification("");
              setValue("");
              setSpecValues([FIXED_ROW]); 
              setOpenDialog(true);
            }}
          >
            Create Technical Specification
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
                <TableCell>Product</TableCell>
                <TableCell>Operation</TableCell>
                <TableCell>Item</TableCell>
                <TableCell>Grade Code</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredConstructionData?.length > 0 ? (
                filteredConstructionData.map((row, index) => (
                  <TableRow key={row.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{row.internalWoid}</TableCell>
                    <TableCell>
                      {productDetailsMap[row.productId] || "-"}
                    </TableCell>
                    <TableCell>
                      {operations.find((op) => String(op.operationId) === String(row.operationId))
                        ?.operationName || "-"}
                    </TableCell>
                    <TableCell>
                      {items.find((item) => String(item.id) === String(row.itemId))
                        ?.name || "-"}
                    </TableCell>
                     <TableCell>
                        {row.gradecode || "-"}
                      </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View">
                        <IconButton color="primary" onClick={() => handleViewCDS(row)}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton color="secondary" onClick={() => handleEditCDS(row)}>
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
                  <TableCell colSpan={9} align="center">
                    No construction design sheet found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEdit ? "Edit Technical Specification" : "Create Technical Specification"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            {/* Internal Work Order Dropdown */}
            <TextField
              select
              label="Internal Work Order"
              value={selectedInternalWO}
              onChange={(e) => {
                const val = e.target.value;
                console.log(val)
                setSelectedInternalWO(val);
                setSelectedProduct("");
                loadProductsByInternalWO(val);
              }}
              fullWidth
              sx={{ mt: 2 }}
            >
              <MenuItem value=""></MenuItem>
              {internalWorkOrders.map((wo) => (
                <MenuItem key={wo.id} value={wo.id}>
                  {wo.id}
                </MenuItem>
              ))}
            </TextField>

            {/* Product Dropdown */}
            <TextField
              select
              label="Product"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              fullWidth
              sx={{ mt: 2 }}
            >
              <MenuItem value="">Select Product</MenuItem>
              {products.map((product) => (
                <MenuItem key={product.id} value={product.id}>
                  {productDetailsMap[product.id] || product.name || product.product_name}
                </MenuItem>
              ))}
            </TextField>
            {/* Item Dropdown */}
            <TextField
              select
              label="Item"
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              fullWidth
              sx={{ mt: 2 }}
            >
              <MenuItem value="">Select Item</MenuItem>
              {items.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name || item.itemName}
                </MenuItem>
              ))}
            </TextField>

                          {/* Grade Code Section */}
{isEdit && (
  <TextField
    label="Grade Code"
    value={selectedGradeCode}
    fullWidth
    sx={{ mt: 2 }}
    disabled
  />
)}



            <TextField
              select
              label="Operation"
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
          </Stack>

          {/* Operation, Spec, Value */}
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
