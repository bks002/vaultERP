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
} from "@mui/material";
import { getCategories } from "../../Services/InventoryService";
import { useSelector } from "react-redux";

const Stock = () => {
  const officeId = useSelector((state) => state.user.officeId);
  const [selectedTab, setSelectedTab] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedDescription, setSelectedDescription] = useState("");
  const [quantity, setQuantity] = useState("");

  const [stockData, setStockData] = useState([]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories(officeId);
      setCategories(data || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error.message);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (officeId > 0) {
      loadCategories();
    }
  }, [officeId]);

  // Get descriptions of selected tab category
  const selectedCategory = categories[selectedTab];

  // Get descriptions of selected category in dialog
  const dialogCategory = categories.find(cat => cat.id === selectedCategoryId);

  const handleAddStock = () => {
    if (selectedCategoryId && selectedDescription && quantity) {
      const existing = stockData.find(
        (s) =>
          s.categoryId === selectedCategoryId &&
          s.description === selectedDescription
      );

      if (existing) {
        // If already exists, update quantity
        existing.quantity += parseInt(quantity);
        setStockData([...stockData]);
      } else {
        // New entry
        setStockData([
          ...stockData,
          {
            categoryId: selectedCategoryId,
            description: selectedDescription,
            quantity: parseInt(quantity),
          },
        ]);
      }

      // Reset form and close
      setSelectedCategoryId("");
      setSelectedDescription("");
      setQuantity("");
      setOpenDialog(false);
    }
  };

  return (
    <Box p={1}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" gutterBottom>
          Stock Page
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenDialog(true)}
        >
          Add Stock
        </Button>
      </Box>

      {/* Tabs — Category Names */}
      <Tabs
        value={selectedTab}
        onChange={(_, newValue) => setSelectedTab(newValue)}
        textColor="primary"
        indicatorColor="primary"
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3 }}
      >
        {categories.map((cat, index) => (
          <Tab key={index} label={cat.name} />
        ))}
      </Tabs>

      {/* Stock List */}
      <Stack spacing={2}>
       {!loading && selectedCategory ? (
  selectedCategory.description.split(",").map((desc, index) => {
    const stockItem = stockData.find(
      (s) =>
        s.categoryId === selectedCategory.id &&
        s.description.trim() === desc.trim()
    );
    const quantity = stockItem?.quantity || 0;
    const isHighStock = quantity >= 1000;

    return (
      <Box key={index}>
        <Box display="flex" alignItems="center">
          <Typography sx={{ minWidth: "130px", fontWeight: 600 }}>
            Description:
          </Typography>
          <Paper
            elevation={2}
            sx={{
              flex: 1,
              borderRadius: "12px",
              backgroundColor: isHighStock ? "#e8f5e9" : "#ffe5e5",
              px: 2,
              py: 1,
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={1}
            >
              <Typography>{desc.trim()}</Typography>
              <Chip
                label={`Qty: ${quantity}`}
                size="small"
                color={isHighStock ? "success" : "default"}
              />
            </Box>
          </Paper>
        </Box>
      </Box>
    );
  })
) : (
  <Typography>No data available.</Typography>
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
                setSelectedDescription("");
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
              label="Select Description"
              value={selectedDescription}
              onChange={(e) => setSelectedDescription(e.target.value)}
              fullWidth
              disabled={!selectedCategoryId}
            >
              {dialogCategory?.description?.split(",").map((desc, i) => (
                <MenuItem key={i} value={desc.trim()}>
                  {desc.trim()}
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
