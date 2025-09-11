import React, { useEffect, useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";
import { useSelector } from "react-redux";
import axios from "axios";

export default function WorkInProcess() {
  const officeId = useSelector((state) => state.user.officeId);
  const [data, setData] = useState([]);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `https://admin.urest.in:8089/api/WorkInProcess/aggregate/${officeId}`
      );
      setData(response.data);
    } catch (err) {
      console.error("Error fetching aggregated data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [officeId]);

  return (
    <Box p={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Work In Process</Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Internal WO</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Drum Size</TableCell>
              <TableCell>Operation</TableCell>
              <TableCell>Target Achieved</TableCell>
              <TableCell>Board Name</TableCell>
              <TableCell>Party Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{row.entryDate}</TableCell>
                <TableCell>{row.internalWorkOrder}</TableCell>
                <TableCell>{row.productName}</TableCell>
                <TableCell>{row.qty}</TableCell>
                <TableCell>{row.takeUpDrumSize}</TableCell>
                <TableCell>{row.operationName}</TableCell>
                <TableCell>{row.targetAchievedTillDate}</TableCell>
                <TableCell>{row.boardName}</TableCell>
                <TableCell>{row.partyID}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
