import React, { useEffect, useState } from "react";
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import { useSelector } from "react-redux";
import { getExpenseMasterByOffice } from "../../Services/ExpenseMaster";
import { getAssetsByIds } from "../../Services/AssetService";

const ExpenseReport = () => {
    const [expenses, setExpenses] = useState([]);
    const [assetMap, setAssetMap] = useState({});
    const officeId = useSelector((state) => state.user.officeId);

   useEffect(() => {
    const fetchData = async () => {
        try {
            // 1. Fetch expense data
            const expenseData = await getExpenseMasterByOffice(officeId);

            // 2. Extract unique asset IDs
            const assetIds = [
                ...new Set(
                    expenseData
                        .map((item) =>
                            item.assetIds
                                .split(",")
                                .map((id) => id.trim())
                                .filter((id) => id && id !== "-")
                        )
                        .flat()
                ),
            ];

            // 3. Fetch asset names in parallel
            if (assetIds.length > 0) {
                const assetDataArray = await Promise.all(
                    assetIds.map((id) => getAssetsByIds(id))
                );
                const mapping = {};
                assetDataArray.forEach((a) => {
                    mapping[a.assetId] = a.assetName;
                });
                setAssetMap(mapping);
            }

            setExpenses(expenseData);
        } catch (error) {
            console.error("Error fetching expenses:", error);
        }
    };

    fetchData();
}, [officeId]);

    // Format date as DD-MMM-YYYY
    const formatDate = (dateString) => {
        const options = { day: "2-digit", month: "short", year: "numeric" };
        return new Date(dateString).toLocaleDateString("en-GB", options);
    };

    // Map asset IDs to names
    const getAssetNames = (assetIds) => {
        return assetIds
            .split(",")
            .map((id) => assetMap[Number(id.trim())] || id.trim())
            .join(", ");
    };

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Expense Report
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date From</TableCell>
                            <TableCell>Date To</TableCell>
                            <TableCell>Expense Types</TableCell>
                            <TableCell>Expense Subtypes</TableCell>
                            <TableCell>Source</TableCell>
                            <TableCell>Total Amount</TableCell>
                            <TableCell>Total Entries</TableCell>
                            <TableCell>Assets</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {expenses.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>{formatDate(item.dateFrom)}</TableCell>
                                <TableCell>{formatDate(item.dateTo)}</TableCell>
                                <TableCell>{item.expenseTypes}</TableCell>
                                <TableCell>{item.expenseSubtypes}</TableCell>
                                <TableCell>{item.sources}</TableCell>
                                <TableCell>{item.totalAmount}</TableCell>
                                <TableCell>{item.totalEntries}</TableCell>
                                <TableCell>{getAssetNames(item.assetIds)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default ExpenseReport;
