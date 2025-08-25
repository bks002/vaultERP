import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Stack,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  TextField,
  LinearProgress,
} from "@mui/material";
import { getCategories } from "../../Services/InventoryService";
import {
  getAllStock,
  getStockByItem,
  returnStock,
  addStock,
} from "../../Services/StockService";
import { useSelector } from "react-redux";
import ExportCSVButton from "../../Components/Export to CSV/ExportCSVButton";

const Stock = () => {
  const officeId = useSelector((state) => state.user.officeId);
  const [selectedTab, setSelectedTab] = useState(0);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [openReturnDialog, setOpenReturnDialog] = useState(false);
  const [selectedReturnCategoryId, setSelectedReturnCategoryId] = useState("");
  const [selectedReturnItemId, setSelectedReturnItemId] = useState("");
  const [returnQuantity, setReturnQuantity] = useState("");

  // Helper functions
  const getColorByPercentage = (percentage) => {
    if (percentage >= 80) return "success";
    if (percentage >= 50) return "warning";
    if (percentage >= 20) return "info";
    return "error";
  };

  const getPercentageColor = (percentage) => {
    if (percentage >= 80) return "#4caf50";
    if (percentage >= 50) return "#ff9800";
    if (percentage >= 20) return "#2196f3";
    return "#f44336";
  };

  const calculateStockPercentage = (qty) => {
    const maxStock = 1000;
    return Math.min((qty / maxStock) * 100, 100);
  };

  // Reset form helpers
  const resetAddStockForm = () => {
    setSelectedCategoryId("");
    setSelectedItemId("");
    setQuantity("");
  };

  const resetReturnStockForm = () => {
    setSelectedReturnCategoryId("");
    setSelectedReturnItemId("");
    setReturnQuantity("");
    setStockData([]);
  };

  // Fetch categories, items, and stock by item
  useEffect(() => {
    if (officeId > 0) {
      loadCategories();
      loadItems();
      if (selectedReturnItemId) loadStockByItem(selectedReturnItemId);
    }
  }, [officeId, selectedReturnItemId]);

  const loadCategories = async () => {
    try {
      const data = await getCategories(officeId);
      setCategories(data || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err.message);
    }
  };

  const loadItems = async () => {
    try {
      const data = await getAllStock(officeId);
      setItems(
        (data || []).map((item) => ({
          id: item.item_id,
          name: item.name,
          description: item.description,
          categoryId: item.category_id,
          current_qty: item.current_qty,
        }))
      );
    } catch (err) {
      console.error("Failed to fetch items:", err.message);
    }
  };

  const loadStockByItem = async (itemId) => {
    try {
      if (!itemId) return;
      const data = await getStockByItem(itemId);
      setStockData(
        (data || []).map((row) => ({
          po_number: row.po_number,
          item_id: row.item_id,
          name: row.name,
          current_qty: row.current_qty,
          vendor_names: row.vendor_names,
          quantityReturned: "",
        }))
      );
    } catch (err) {
      console.error("Failed to fetch stock by item:", err.message);
    }
  };

  // Add stock handler
  const handleAddStock = async () => {
    try {
      if (!selectedItemId || !quantity) {
        alert("Please select an item and enter quantity.");
        return;
      }
      const payload = {
        item_id: parseInt(selectedItemId, 10),
        office_id: officeId,
        current_qty: parseInt(quantity, 10),
      };
      await addStock(payload);
      alert("Stock added successfully!");
      resetAddStockForm();
      setOpenDialog(false);
      loadItems();
    } catch (error) {
      console.error("Error adding stock:", error.message);
      alert("Failed to add stock. Check console for details.");
    }
  };

  // Return stock handler
  const handleReturnStock = async () => {
    try {
      for (const row of stockData) {
        if (!row.quantityReturned || parseInt(row.quantityReturned) <= 0)
          continue;
        const payload = {
          poNumber: row.po_number,
          itemName: row.name,
          itemId: row.item_id,
          quantityReturned: parseInt(row.quantityReturned, 10),
          officeId: officeId,
          quantity: row.current_qty,
          scanDateTime: new Date().toISOString(),
        };
        await returnStock(payload);
      }
      alert("Stock returned successfully!");
      if (selectedReturnItemId) {
        await loadStockByItem(selectedReturnItemId);
      }
      resetReturnStockForm();
      setOpenReturnDialog(false);
    } catch (err) {
      console.error("Failed to return stock:", err.message);
      alert("Failed to return stock. Check console for details.");
    }
  };

  const csvHeaders = [
    { label: "Item ID", key: "id" },
    { label: "Item Name", key: "name" },
    { label: "Category ID", key: "categoryId" },
    { label: "Quantity", key: "current_qty" },
  ];

  const itemsInCategory = items.filter(
    (item) => item.categoryId === (categories[selectedTab]?.id || "")
  );

  if (categories.length === 0) {
    return <Typography>No categories available.</Typography>;
  }

  return (
    <Box p={1}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" gutterBottom>
          Stock Page
        </Typography>
        <Stack direction="row" spacing={2}>
          <ExportCSVButton
            data={itemsInCategory}
            filename="stock.csv"
            headers={csvHeaders}
          />
          <Button variant="contained" onClick={() => setOpenReturnDialog(true)}>
            Return Stock
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenDialog(true)}
          >
            Add Stock
          </Button>
        </Stack>
      </Box>

      <Tabs
        value={selectedTab}
        onChange={(_, newValue) => setSelectedTab(newValue)}
        textColor="primary"
        indicatorColor="primary"
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3 }}
      >
        {categories.map((cat) => (
          <Tab key={cat.id} label={cat.name} />
        ))}
      </Tabs>

      <Stack spacing={2}>
        {itemsInCategory.length > 0 ? (
          itemsInCategory.map((item) => {
            const stock = stockData.find((s) => s.item_id === item.id);
            const qty = stock ? stock.current_qty : item.current_qty || 0;
            const percentage = calculateStockPercentage(qty);
            const color = getPercentageColor(percentage);

            return (
              <Box key={item.id} display="flex" alignItems="center" gap={2}>
                <Box width="200px" flexShrink={0}>
                  <Typography fontWeight={600}>{item.name}</Typography>
                </Box>
                <Paper
                  elevation={2}
                  sx={{ flexGrow: 1, borderRadius: "12px", px: 2, py: 1 }}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{
                        flexGrow: 1,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "#e0e0e0",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: color,
                          borderRadius: 4,
                        },
                      }}
                    />
                    <Chip
                      label={`Qty: ${qty}`}
                      color={getColorByPercentage(percentage)}
                      size="small"
                    />
                  </Box>
                </Paper>
              </Box>
            );
          })
        ) : (
          <Typography>No items found for this category.</Typography>
        )}
      </Stack>

      {/* Add Stock Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => {
          resetAddStockForm();
          setOpenDialog(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Stock</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              select
              label="Select Category"
              value={selectedCategoryId}
              onChange={(e) => {
                setSelectedCategoryId(e.target.value);
                setSelectedItemId("");
              }}
              fullWidth
            >
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Select Item"
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              disabled={!selectedCategoryId}
              fullWidth
            >
              {items
                .filter((i) => i.categoryId === selectedCategoryId)
                .map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
            </TextField>

            <TextField
              label="Quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              resetAddStockForm();
              setOpenDialog(false);
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={handleAddStock}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Return Stock Dialog */}
      <Dialog
        open={openReturnDialog}
        onClose={() => {
          resetReturnStockForm();
          setOpenReturnDialog(false);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Return Stock</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              select
              label="Select Category"
              value={selectedReturnCategoryId}
              onChange={(e) => {
                setSelectedReturnCategoryId(e.target.value);
                setSelectedReturnItemId("");
              }}
              fullWidth
            >
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Select Item"
              value={selectedReturnItemId}
              onChange={(e) => setSelectedReturnItemId(e.target.value)}
              disabled={!selectedReturnCategoryId}
              fullWidth
            >
              {items
                .filter((i) => i.categoryId === selectedReturnCategoryId)
                .map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
            </TextField>

            {selectedReturnItemId && (
              <Box mt={2}>
                <Paper>
                  <Box
                    component="table"
                    sx={{ width: "100%", borderCollapse: "collapse" }}
                  >
                    <Box component="thead" sx={{ backgroundColor: "#f5f5f5" }}>
                      <Box component="tr">
                        <Box
                          component="th"
                          sx={{ border: "1px solid #ddd", p: 1 }}
                        >
                          PO Number
                        </Box>
                        <Box
                          component="th"
                          sx={{ border: "1px solid #ddd", p: 1 }}
                        >
                          Item Name
                        </Box>
                        <Box
                          component="th"
                          sx={{ border: "1px solid #ddd", p: 1 }}
                        >
                          Current Qty
                        </Box>
                        <Box
                          component="th"
                          sx={{ border: "1px solid #ddd", p: 1 }}
                        >
                          Vendor Name
                        </Box>
                        <Box
                          component="th"
                          sx={{ border: "1px solid #ddd", p: 1 }}
                        >
                          Quantity Returned
                        </Box>
                      </Box>
                    </Box>
                    <Box component="tbody">
                      {stockData.length > 0 ? (
                        stockData.map((row, index) => (
                          <Box component="tr" key={index}>
                            <Box
                              component="td"
                              sx={{ border: "1px solid #ddd", p: 1 }}
                            >
                              {row.po_number}
                            </Box>
                            <Box
                              component="td"
                              sx={{ border: "1px solid #ddd", p: 1 }}
                            >
                              {row.name}
                            </Box>
                            <Box
                              component="td"
                              sx={{ border: "1px solid #ddd", p: 1 }}
                            >
                              {row.current_qty}
                            </Box>
                            <Box
                              component="td"
                              sx={{ border: "1px solid #ddd", p: 1 }}
                            >
                              {row.vendor_names}
                            </Box>
                            <Box
                              component="td"
                              sx={{ border: "1px solid #ddd", p: 1 }}
                            >
                              <TextField
                                variant="outlined"
                                size="small"
                                value={row.quantityReturned}
                                onChange={(e) => {
                                  const updated = [...stockData];
                                  updated[index] = {
                                    ...updated[index],
                                    quantityReturned: e.target.value,
                                  };
                                  setStockData(updated);
                                }}
                              />
                            </Box>
                          </Box>
                        ))
                      ) : (
                        <Box component="tr">
                          <Box
                            component="td"
                            colSpan={5}
                            sx={{ textAlign: "center", p: 2 }}
                          >
                            No stock records for this item
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Paper>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              resetReturnStockForm();
              setOpenReturnDialog(false);
            }}
          >
            Close
          </Button>
          <Button variant="contained" onClick={handleReturnStock}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Stock;
