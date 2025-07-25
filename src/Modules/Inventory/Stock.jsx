import React, { useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Stack,
  Chip,
  LinearProgress,
} from "@mui/material";

const stockData = [
  { category: "All", name: "Haprik", description: "toilet cleaner", quantity: 10 },
  { category: "All", name: "Milks", description: "Full Cream Milk", quantity: 200 },
  { category: "All", name: "PVC pipe", description: "4 inch", quantity: 2000 },
  { category: "All", name: "Pen", description: "Plastic Ball point pen", quantity: 2 },
  { category: "All", name: "Electical Tape", description: "Electical Tape", quantity: 900 },
  { category: "HK Consumables", name: "Dettol", description: "Antiseptic Liquid", quantity: 300 },
  { category: "MEP Consumables", name: "Wire", description: "Copper Wire", quantity: 5000 },
  { category: "Gardening Material", name: "Fertilizer", description: "Organic compost", quantity: 6 },
  { category: "Office Stationery", name: "Stapler", description: "Heavy Duty", quantity: 4 },
  { category: "Pantry Materials", name: "Tea", description: "Green Tea", quantity: 800 },
];

const categories = [
  "All",
  "HK Consumables",
  "MEP Consumables",
  "Gardening Material",
  "Office Stationery",
  "Pantry Materials",
];

const Stock = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const selectedCategory = categories[selectedTab];

  const filteredData = selectedCategory === "All"
    ? stockData.filter((item) => item.category === "All")
    : stockData.filter((item) => item.category === selectedCategory);

  return (
    <Box p={1}>
      <Typography variant="h4" gutterBottom>
        Stock Page
      </Typography>

      {/* Tab Bar */}
      <Tabs
        value={selectedTab}
        onChange={(_, newValue) => setSelectedTab(newValue)}
        textColor="primary"
        indicatorColor="primary"
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3 }}
      >
        {categories.map((cat, i) => (
          <Tab key={i} label={cat} />
        ))}
      </Tabs>

      {/* Item Bars */}
      <Stack spacing={2}>
        {filteredData.map((item, index) => {
          const percentage = Math.min((item.quantity / 10000) * 100, 100);
          const barColor = item.quantity < 1000 ? "#d32f2f" : "green"; // light red / dark red

          return (
            <Box key={index}>
              <Box display="flex" alignItems="center">
                {/* Item Name on the Left */}
                <Typography sx={{ minWidth: "130px", fontWeight: 600 }}>
                  {item.name} :
                </Typography>

                {/* Description + Quantity Bar */}
                <Paper
                  elevation={2}
                  sx={{
                    flex: 1,
                    borderRadius: "12px",
                    backgroundColor: "#f5f5f5",
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
                    <Typography>{item.description}</Typography>
                    <Chip
                      label={`Quantity: ${item.quantity}`}
                      size="small"
                      color="default"
                    />
                  </Box>

                  {/* Custom Red Bar */}
                  <Box
                    sx={{
                      width: "100%",
                      height: 10,
                      backgroundColor: "#eee",
                      borderRadius: "5px",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        width: `${percentage}%`,
                        height: "100%",
                        backgroundColor: barColor,
                      }}
                    />
                  </Box>
                </Paper>
              </Box>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};

export default Stock;
