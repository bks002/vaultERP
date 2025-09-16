import React, { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer,Typography,
  TableHead, TableRow, Paper, CircularProgress, Container,Box
} from "@mui/material";
import { useSelector } from "react-redux";

const AssetDowntimeReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const officeId = useSelector((state) => state.user.officeId);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(`https://admin.urest.in:8089/api/AssetDowntime/finalreport?officeId=${officeId}`);
        const result = await response.json();
        setData(result);
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
        <Typography variant="h4">Asset Downtime Report</Typography>
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
            <TableCell>Asset ID</TableCell>
            <TableCell>Asset Name</TableCell>
            <TableCell>Total Spare Downtime</TableCell>
            <TableCell>Total Service Duration</TableCell>
            <TableCell>Total Asset Downtime</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map(row => (
            <TableRow key={row.assetId}>
              <TableCell>{row.assetId}</TableCell>
              <TableCell>{row.assetName}</TableCell>
              <TableCell>{row.totalSpareDowntime}</TableCell>
              <TableCell>{row.totalServiceDuration}</TableCell>
              <TableCell>{row.totalAssetDowntime}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    </Container>
  );
};

export default AssetDowntimeReport;