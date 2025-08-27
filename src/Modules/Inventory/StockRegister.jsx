import React, { useEffect, useState } from "react";
import {
  fetchIssueData
} from "../../Services/StockRegister";
import {
  Table, TableBody, TableCell, TableContainer,Typography,
  TableHead, TableRow, Paper, CircularProgress, Container,Box
} from "@mui/material";
import {getAllItems} from "../../Services/InventoryService"
import {getAllEmployees} from "../../Services/EmployeeService";
import { useSelector } from "react-redux";

const StockRegister = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const officeId = useSelector((state) => state.user.officeId);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split("T")[0];

        const [issues, items, employees] = await Promise.all([
          fetchIssueData(officeId, today),
          getAllItems(officeId),
          getAllEmployees(officeId)
        ]);

        // Maps for fast lookup
        const itemMap = Object.fromEntries(items.map(i => [i.id, i.name]));
        const empMap = Object.fromEntries(employees.map(e => [e.employeeId, e.employeeName]));

        const enriched = issues.map(issue => ({
          ...issue,
          itemName: itemMap[issue.itemId] || "N/A",
          employeeName: empMap[issue.employeeId] || "N/A",
        }));

        setData(enriched);
      } catch (error) {
        console.error("Error loading data", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [officeId]);

  if (loading) return <CircularProgress />;

  return (
    <Container>
    <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4">Stock Register</Typography>
        <Box display="flex" alignItems="center" gap={2}>
          {/* <TextField
            variant="outlined"
            sx={{ width: 300 }}
            placeholder="Search by Asset name, Manufacturer"

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
          /> */}

          {/* <ExportCSVButton
            data={filteredAssets}
            filename="Assets.csv"
            headers={csvHeaders}
          /> */}
        </Box>
      </Box>
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Operation</TableCell>
            <TableCell>Item</TableCell>
            <TableCell>Employee</TableCell>
            <TableCell>Quantity Issued</TableCell>
            <TableCell>Total Quantity</TableCell>
            <TableCell>Date Time</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map(row => (
            <TableRow key={row.id}>
              <TableCell>{row.id}</TableCell>
              <TableCell>{row.operation}</TableCell>
              <TableCell>{row.itemName}</TableCell>
              <TableCell>{row.employeeName}</TableCell>
              <TableCell>{row.quantityIssued}</TableCell>
              <TableCell>{row.totalQuantity}</TableCell>
              <TableCell>{new Date(row.createdOn).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    </Container>
  );
};

export default StockRegister;