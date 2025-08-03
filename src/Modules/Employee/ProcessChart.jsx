import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
    getGroupedProcesses,
    saveProcess,
    updateProcess,
    deleteProcess
} from "../../Services/ProcessService";
import { getAllOperation } from "../../Services/OperationService";
import {
    Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Select, MenuItem, InputLabel, FormControl, Chip, Box, IconButton,
    Container, Typography, Tooltip
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const ProcessFlowDisplay = ({ operations }) => {
    if (!operations?.length) return null;

    const maxPerRow = 5;
    const totalRows = Math.ceil(operations.length / maxPerRow);
    const rows = [];

    for (let i = 0; i < totalRows; i++) {
        const startIdx = i * maxPerRow;
        const endIdx = Math.min(startIdx + maxPerRow, operations.length);
        const rowOps = operations.slice(startIdx, endIdx);
        const isEvenRow = i % 2 === 0;
        const displayOps = isEvenRow ? rowOps : [...rowOps].reverse();
        const rowContent = [];
        displayOps.forEach((op, idx) => {
            rowContent.push(
                <Tooltip key={`op-${i}-${idx}`} title={op.operationName} arrow>
                    <Chip
                        label={
                            <Typography sx={{
                                fontWeight: 600,
                                color: '#0d47a1'
                            }}>
                                {op.operationName}
                            </Typography>
                        }
                        sx={{
                            backgroundColor: '#e3f2fd',
                            border: '2px solid #2196f3',
                            borderRadius: '50px',
                            px: 3,
                            py: 2,
                            fontSize: '1rem',
                            minWidth: 180,
                            justifyContent: 'center',
                            boxShadow: 2
                        }}
                    />
                </Tooltip>
            );

            if (idx < displayOps.length - 1) {
                rowContent.push(
                    <ArrowForwardIcon
                        key={`arrow-${i}-${idx}`}
                        sx={{
                            fontSize: 28,
                            color: '#2196f3',
                            mx: 1,
                            transform: isEvenRow ? 'none' : 'rotate(180deg)'
                        }}
                    />
                );
            }
        });

        let downArrowPosition = 'center';
        let downArrowMargin = {};

        if (i < totalRows - 1) {
            if (isEvenRow) {
                downArrowPosition = 'flex-end';
                downArrowMargin = { mr: '200px' }; 
            } else {  
                downArrowPosition = 'flex-start';
                downArrowMargin = { ml: '200px' }; 
            }
        }

        rows.push(
            <Box key={i} display="flex" flexDirection="column" width="100%">
                {/* Row with operations */}
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent={isEvenRow ? "flex-start" : "flex-end"}
                    width="100%"
                >
                    {rowContent}
                </Box>

                {/* Vertical arrow to next row */}
                {i < totalRows - 1 && (
                    <Box mt={1} display="flex" width="100%">
                        <Box
                            flex={1}
                            display="flex"
                            justifyContent={isEvenRow ? 'flex-end' : 'flex-start'}
                            px={isEvenRow ? 9 : 9}
                        >
                            <ArrowDownwardIcon sx={{ fontSize: 30, color: '#2196f3' }} />
                        </Box>
                    </Box>
                )}
            </Box>
        );
    }

    return (
        <Box mt={3} display="flex" flexDirection="column" width="100%">
            {rows}
        </Box>
    );
};

const ProcessDialog = ({
    open, onClose, title, processName, setProcessName,
    selectedOperations, setSelectedOperations,
    availableOperations, onSave, saveText
}) => {
    const [dragIndex, setDragIndex] = useState(null);

    const handleDragStart = (index) => {
        setDragIndex(index);
    };

    const handleDragOver = (e) => {
        e.preventDefault(); 
    };

    const handleDrop = (dropIndex) => {
        if (dragIndex === null || dragIndex === dropIndex) return;
        const newOrder = [...selectedOperations];
        const [movedItem] = newOrder.splice(dragIndex, 1);
        newOrder.splice(dropIndex, 0, movedItem);
        setSelectedOperations(newOrder);
        setDragIndex(null);
    };

    const handleAddOperation = (id) => {
        if (!selectedOperations.includes(id)) {
            setSelectedOperations([...selectedOperations, id]);
        }
    };

    const handleRemoveOperation = (id) => {
        setSelectedOperations(selectedOperations.filter(op => op !== id));
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <TextField
                    label="Process Name"
                    value={processName}
                    onChange={(e) => setProcessName(e.target.value)}
                    fullWidth
                    margin="normal"
                />

                <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Select Operation to Add</InputLabel>
                    <Select
                        value=""
                        onChange={(e) => handleAddOperation(e.target.value)}
                    >
                        {availableOperations
                            .filter(op => !selectedOperations.includes(op.operationId))
                            .map(op => (
                                <MenuItem key={op.operationId} value={op.operationId}>
                                    {op.operationName}
                                </MenuItem>
                            ))}
                    </Select>
                </FormControl>

                <Typography sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
                    Drag to Reorder
                </Typography>

                <Box
                    sx={{
                        border: '1px solid #ccc',
                        borderRadius: 2,
                        p: 2,
                        backgroundColor: '#f9f9f9',
                    }}
                >
                    {(() => {
                        const maxPerRow = 4;
                        const totalRows = Math.ceil(selectedOperations.length / maxPerRow);
                        const rows = [];

                        for (let row = 0; row < totalRows; row++) {
                            const start = row * maxPerRow;
                            const end = Math.min(start + maxPerRow, selectedOperations.length);
                            const rowOps = selectedOperations.slice(start, end);
                            const isEven = row % 2 === 0;
                            const displayOps = isEven ? rowOps : [...rowOps].reverse();

                            const rowContent = displayOps.map((id, idx) => {
                                const op = availableOperations.find(o => o.operationId === id);
                                const realIdx = selectedOperations.indexOf(id); 
                                return (
                                    <React.Fragment key={`chip-${row}-${idx}`}>
                                        <Box
                                            draggable
                                            onDragStart={() => handleDragStart(realIdx)}
                                            onDragOver={handleDragOver}
                                            onDrop={() => handleDrop(realIdx)}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                p: 1,
                                                backgroundColor: '#e3f2fd',
                                                border: '1px solid #2196f3',
                                                borderRadius: 2,
                                                minWidth: 150,
                                                justifyContent: 'space-between',
                                                cursor: 'grab',
                                                boxShadow: 1,
                                            }}
                                        >
                                            <Typography sx={{ fontWeight: 600, color: '#0d47a1' }}>
                                                {op?.operationName || id}
                                            </Typography>
                                            <Button
                                                size="small"
                                                color="error"
                                                onClick={() => handleRemoveOperation(id)}
                                                sx={{ ml: 1 }}
                                            >
                                                X
                                            </Button>
                                        </Box>

                                        {idx < displayOps.length - 1 && (
                                            <ArrowForwardIcon
                                                sx={{
                                                    color: '#2196f3',
                                                    fontSize: 28,
                                                    mx: 1,
                                                    transform: isEven ? 'none' : 'rotate(180deg)'
                                                }}
                                            />
                                        )}
                                    </React.Fragment>
                                );
                            });

                            rows.push(
                                <Box
                                    key={`row-${row}`}
                                    display="flex"
                                    justifyContent={isEven ? "flex-start" : "flex-end"}
                                    alignItems="center"
                                    mb={row < totalRows - 1 ? 1 : 0}
                                >
                                    {rowContent}
                                </Box>
                            );

                            if (row < totalRows - 1) {
                                rows.push(
                                    <Box
                                        key={`arrow-down-${row}`}
                                        display="flex"
                                        justifyContent={isEven ? 'flex-end' : 'flex-start'}
                                        px={isEven ? 9 : 9}
                                        mb={1}
                                    >
                                        <ArrowDownwardIcon sx={{ fontSize: 30, color: '#2196f3' }} />
                                    </Box>
                                );
                            }
                        }

                        return rows;
                    })()}
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={onSave}
                    variant="contained"
                    color="primary"
                    disabled={!processName || selectedOperations.length === 0}
                >
                    {saveText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const ProcessChartMaster = () => {
    const officeId = useSelector((state) => state.user.officeId);
    const [open, setOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [processName, setProcessName] = useState("");
    const [selectedOperations, setSelectedOperations] = useState([]);
    const [availableOperations, setAvailableOperations] = useState([]);
    const [groupedProcesses, setGroupedProcesses] = useState([]);
    const [editingProcess, setEditingProcess] = useState(null);

    useEffect(() => {
        if (!officeId) return;
        refreshProcessData();
    }, [officeId]);

    const refreshProcessData = async () => {
        try {
            const [ops, procs] = await Promise.all([
                getAllOperation(officeId),
                getGroupedProcesses(officeId)
            ]);

            const enriched = procs.map(proc => ({
                ...proc,
                processId: proc.processId ?? proc.process_id ?? 0,
                operations: proc.operations.map(op => ({
                    ...op,
                    operationName: ops.find(o => o.operationId === op.operationId)?.operationName || "Unknown"
                }))
            }));

            setAvailableOperations(ops);
            setGroupedProcesses(enriched);
        } catch (err) {
            console.error("Error fetching data:", err);
        }
    };

    const resetForm = () => {
        setProcessName("");
        setSelectedOperations([]);
        setEditingProcess(null);
    };

    const handleSave = async () => {
        const operations = selectedOperations.map((id, index) => ({
            operationId: id,
            stepOrder: index + 1
        }));
        const payload = {
            processName,
            officeId,
            createdBy: officeId,
            operations
        };
        await saveProcess(payload);
        await refreshProcessData();
        setOpen(false);
        resetForm();
    };

    const handleEditSave = async () => {
        const operations = selectedOperations.map((id, index) => ({
            operationId: id,
            stepOrder: index + 1
        }));
        const payload = {
            processName,
            officeId,
            updatedBy: officeId,
            operations
        };
        await updateProcess(editingProcess.processId, payload);
        await refreshProcessData();
        setEditOpen(false);
        resetForm();
    };

    const handleEditProcess = (proc) => {
        setEditingProcess(proc);
        setProcessName(proc.processName);
        setSelectedOperations(proc.operations.map(op => op.operationId));
        setEditOpen(true);
    };

    const handleDeleteProcess = async (proc) => {
        if (window.confirm(`Delete process '${proc.processName}'?`)) {
            await deleteProcess(proc.processId);
            await refreshProcessData();
        }
    };

    return (
        <Container maxWidth={false}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4">Process Flow</Typography>
                <Button variant="contained" onClick={() => setOpen(true)}>Create Process</Button>
            </Box>

            {groupedProcesses.length ? groupedProcesses.map((proc, i) => (
                <Box key={i} mb={3}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" sx={{
                        mb: 5, 
                        p: 2,
                        border: '1px solid #ccc', 
                        borderRadius: 2,
                        backgroundColor: '#fefefe', 
                        boxShadow: 1 
                    }}>
                        <Typography variant="h6">{proc.processName}</Typography>
                        <Box>
                            <IconButton color="primary" onClick={() => handleEditProcess(proc)}><EditIcon /></IconButton>
                            <IconButton color="error" onClick={() => handleDeleteProcess(proc)}><DeleteIcon /></IconButton>
                        </Box>
                    </Box>
                    <ProcessFlowDisplay operations={proc.operations} />
                </Box>
            )) : <Typography>No processes found</Typography>}

            <ProcessDialog
                open={open}
                onClose={() => { setOpen(false); resetForm(); }}
                title="Create Process"
                processName={processName}
                setProcessName={setProcessName}
                selectedOperations={selectedOperations}
                setSelectedOperations={setSelectedOperations}
                availableOperations={availableOperations}
                onSave={handleSave}
                saveText="Save"
            />

            <ProcessDialog
                open={editOpen}
                onClose={() => { setEditOpen(false); resetForm(); }}
                title="Edit Process"
                processName={processName}
                setProcessName={setProcessName}
                selectedOperations={selectedOperations}
                setSelectedOperations={setSelectedOperations}
                availableOperations={availableOperations}
                onSave={handleEditSave}
                saveText="Update"
            />
        </Container>
    );
};

export default ProcessChartMaster;