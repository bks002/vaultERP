// src/components/DataTable.jsx
import React from 'react';
import {
    Table, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';

const DataTable = ({ columns = [], rows = [] }) => {
    return (
        <Table sx={{ mt: 3 }}>
            <TableHead>
                <TableRow>
                    {columns.map((col, i) => (
                        <TableCell key={i}>{col.label}</TableCell>
                    ))}
                </TableRow>
            </TableHead>
            <TableBody>
                {rows.map((row, i) => (
                    <TableRow key={i}>
                        {columns.map((col, j) => (
                            <TableCell key={j}>{row[col.field]}</TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default DataTable;
