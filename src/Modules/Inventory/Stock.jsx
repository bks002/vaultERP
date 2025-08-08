import React, { useEffect, useState } from "react";
import {
  Box, Typography, Tabs, Tab, Paper, Stack, Chip, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, MenuItem, TextField, LinearProgress
} from "@mui/material";
import { getCategories } from "../../Services/InventoryService";
import { getAllStock } from "../../Services/StockService";
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

  // Function to get color based on percentage
  const getColorByPercentage = (percentage) => {
    if (percentage >= 80) return "success";
    if (percentage >= 50) return "warning";
    if (percentage >= 20) return "info";
    return "error";
  };

  // Function to get percentage color
  const getPercentageColor = (percentage) => {
    if (percentage >= 80) return "#4caf50"; // Green
    if (percentage >= 50) return "#ff9800"; // Orange
    if (percentage >= 20) return "#2196f3"; // Blue
    return "#f44336"; // Red
  };

  // Function to calculate stock percentage (assuming max stock is 1000 for demo)
  const calculateStockPercentage = (quantity) => {
    const maxStock = 1000; // You can adjust this based on your business logic
    return Math.min((quantity / maxStock) * 100, 100);
  };

  useEffect(() => {
    if (officeId > 0) {
      loadCategories();
      loadItems();
    }
  }, [officeId]);

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
      const data = await getAllStock(officeId); // ✅ New API call
      const mappedItems = data.map((item) => ({
        id: item.item_id,
        name: item.name,
        categoryId: item.category_id,
        current_qty: item.current_qty
      }));
      setItems(mappedItems || []);
    } catch (err) {
      console.error("Failed to fetch items:", err.message);
    }
  };

  const handleAddStock = () => {
    if (selectedCategoryId && selectedItemId && quantity) {
      const item = items.find(i => i.id === selectedItemId);
      const existing = stockData.find(s => s.itemId === selectedItemId);

      if (existing) {
        existing.quantity += parseInt(quantity);
        setStockData([...stockData]);
      } else {
        setStockData([
          ...stockData,
          {
            itemId: selectedItemId,
            name: item?.name,
            categoryId: selectedCategoryId,
            quantity: parseInt(quantity),
          },
        ]);
      }

      setSelectedCategoryId("");
      setSelectedItemId("");
      setQuantity("");
      setOpenDialog(false);
    }
  };

  const csvHeaders = [
    { label: "Item ID", key: "itemId" },
    { label: "Item Name", key: "name" },
    { label: "Category ID", key: "categoryId" },
    { label: "Quantity", key: "current_qty" },
  ];
  const itemsInCategory = items.filter(item => item.categoryId === (categories[selectedTab]?.id || ""));
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
          <Button variant="contained" color="primary" onClick={() => setOpenDialog(true)}>
            Add Stock
          </Button>
        </Stack>
      </Box>

      <Tabs
        value={selectedTab}
        onChange={(_, newVal) => setSelectedTab(newVal)}
        textColor="primary"
        indicatorColor="primary"
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3 }}
      >
        {categories.map((cat, index) => (
          <Tab key={cat.id} label={cat.name} />
        ))}
      </Tabs>

      {/* Stock List */}
      <Stack spacing={2}>
        {itemsInCategory.length > 0 ? (
          itemsInCategory.map((item) => {
            const stock = stockData.find(s => s.itemId === item.id);
            const quantity = stock?.quantity || item.current_qty || 0;
            const percentage = calculateStockPercentage(quantity);
            const color = getPercentageColor(percentage);

            return (
              <Box key={item.id} display="flex" alignItems="center" gap={2}>
                <Box width="200px" flexShrink={0}>
                  <Typography fontWeight={600}>
                    {item.name}
                  </Typography>
                </Box>
                <Paper
                  elevation={2}
                  sx={{
                    flexGrow: 1,
                    borderRadius: "12px",
                    px: 2,
                    py: 1,
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{
                        flexGrow: 1,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: color,
                          borderRadius: 4,
                        }
                      }}
                    />
                    <Chip 
                      label={`Qty: ${quantity}`} 
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
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
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
              {items.filter(i => i.categoryId === selectedCategoryId).map((item) => (
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
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddStock}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Stock;
