// SingleProcessFlow.jsx
import React, { useEffect, useState } from "react";
import { getGroupedProcesses } from "../Services/ProcessService";
import { getAllOperation } from "../Services/OperationService";
import { Box, Typography } from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { Chip, Tooltip } from "@mui/material";

const SingleProcessFlow = ({ officeId, processId }) => {
    const [operations, setOperations] = useState([]);

    useEffect(() => {
        if (!officeId || !processId) return;

        const fetchProcess = async () => {
            try {
                const [ops, procs] = await Promise.all([
                    getAllOperation(officeId),
                    getGroupedProcesses(officeId)
                ]);

                const selectedProcess = procs.find(p => p.processId === processId);
                if (!selectedProcess) return;

                const enrichedOps = selectedProcess.operations.map(op => ({
                    ...op,
                    operationName: ops.find(o => o.operationId === op.operationId)?.operationName || "Unknown"
                }));

                setOperations(enrichedOps);
            } catch (err) {
                console.error("Error fetching process flow:", err);
            }
        };

        fetchProcess();
    }, [officeId, processId]);

    if (!operations.length) return <Typography>No operations found</Typography>;

    // Reuse your flow layout
    const maxPerRow = 4;
    const totalRows = Math.ceil(operations.length / maxPerRow);
    const rows = [];

    for (let i = 0; i < totalRows; i++) {
        const startIdx = i * maxPerRow;
        const endIdx = Math.min(startIdx + maxPerRow, operations.length);
        const rowOps = operations.slice(startIdx, endIdx);
        const isEvenRow = i % 2 === 0;
        const displayOps = isEvenRow ? rowOps : [...rowOps].reverse();

        const rowContent = displayOps.map((op, idx) => (
            <React.Fragment key={`op-${i}-${idx}`}>
                <Tooltip title={op.operationName} arrow>
                    <Chip
                        label={op.operationName}
                        sx={{
                            backgroundColor: '#e3f2fd',
                            border: '2px solid #2196f3',
                            borderRadius: '50px',
                            px: 3,
                            py: 2,
                            fontSize: '1rem',
                            minWidth: 180,
                            justifyContent: 'center',
                        }}
                    />
                </Tooltip>
                {idx < displayOps.length - 1 && (
                    <ArrowForwardIcon
                        sx={{
                            fontSize: 28,
                            color: '#2196f3',
                            mx: 1,
                            transform: isEvenRow ? 'none' : 'rotate(180deg)'
                        }}
                    />
                )}
            </React.Fragment>
        ));

        rows.push(
            <Box key={i} display="flex" flexDirection="column" width="100%">
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent={isEvenRow ? "flex-start" : "flex-end"}
                    width="100%"
                    mb={1}
                >
                    {rowContent}
                </Box>

                {i < totalRows - 1 && (
                    <Box display="flex" justifyContent={isEvenRow ? 'flex-end' : 'flex-start'} width="100%">
                        <ArrowDownwardIcon sx={{ fontSize: 30, color: '#2196f3', mx: 2 }} />
                    </Box>
                )}
            </Box>
        );
    }

    return <Box mt={3}>{rows}</Box>;
};

export default SingleProcessFlow;