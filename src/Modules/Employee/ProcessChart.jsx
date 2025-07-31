// import React, { useState, useEffect } from "react";
// import { useSelector } from "react-redux";
// import { getAllOperation } from "../../Services/OperationService";
// import {
//     Button,
//     Dialog,
//     DialogTitle,
//     DialogContent,
//     DialogActions,
//     TextField,
//     Select,
//     MenuItem,
//     InputLabel,
//     FormControl,
//     Chip,
//     Box,
//     IconButton,
//     Container,
//     Typography
// } from "@mui/material";
// import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
// import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
// import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// const ProcessChartMaster = () => {
//     const officeId = useSelector((state) => state.user.officeId);
//     const [open, setOpen] = useState(false);
//     const [processName, setProcessName] = useState("");
//     const [selectedOperations, setSelectedOperations] = useState([]);
//     const [availableOperations, setAvailableOperations] = useState([]);
//     const [savedProcess, setSavedProcess] = useState(null);
//     const [draggedItem, setDraggedItem] = useState(null);

//     useEffect(() => {
//         const fetchOperations = async () => {
//             if (!officeId) return;
//             try {
//                 const data = await getAllOperation(officeId);
//                 setAvailableOperations(Array.isArray(data) ? data.map(op => op.operationName || op.name || op) : []);
//             } catch (error) {
//                 setAvailableOperations([]);
//             }
//         };
//         fetchOperations();
//     }, [officeId]);

//     const handleOpen = () => setOpen(true);
//     const handleClose = () => {
//         setOpen(false);
//         setProcessName("");
//         setSelectedOperations([]);
//     };

//     const handleProcessNameChange = (e) => setProcessName(e.target.value);

//     const handleOperationChange = (e) => {
//         setSelectedOperations(e.target.value);
//     };

//     // Custom drag and drop functions
//     const handleDragStart = (e, operation, index) => {
//         setDraggedItem({ operation, index });
//         e.dataTransfer.effectAllowed = 'move';
//         e.dataTransfer.setData('text/html', e.target.outerHTML);
//     };

//     const handleDragOver = (e) => {
//         e.preventDefault();
//         e.dataTransfer.dropEffect = 'move';
//     };

//     const handleDrop = (e, targetIndex) => {
//         e.preventDefault();
//         if (draggedItem && draggedItem.index !== targetIndex) {
//             const newOrder = [...selectedOperations];
//             const [removed] = newOrder.splice(draggedItem.index, 1);
//             newOrder.splice(targetIndex, 0, removed);
//             setSelectedOperations(newOrder);
//         }
//         setDraggedItem(null);
//     };

//     const handleDragEnd = () => {
//         setDraggedItem(null);
//     };

//     const handleSave = () => {
//         // Here you would handle saving the process flow (e.g., API call)
//         setSavedProcess({ processName, selectedOperations });
//         console.log({ processName, selectedOperations });
//         handleClose();
//     };

//     return (
//         <Container maxWidth={false}>
//             <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
//                 <Typography variant="h4">Process Flow</Typography>
//                 <Box>
//                     <Button variant="contained" color="primary" onClick={handleOpen}>
//                         Create Process Flow
//                     </Button>
//                 </Box>
//             </Box>

//             {/* Show saved process flow graphically */}
//             {savedProcess && (
//                 <Box mb={3}>
//                     <Typography variant="h6" mb={1}>{savedProcess.processName}</Typography>
//                     <Box display="flex" alignItems="center">
//                         {savedProcess.selectedOperations.map((op, idx) => (
//                             <React.Fragment key={op}>
//                                 <Chip label={op} color="primary" />
//                                 {idx < savedProcess.selectedOperations.length - 1 && (
//                                     <ArrowForwardIcon sx={{ mx: 1 }} />
//                                 )}
//                             </React.Fragment>
//                         ))}
//                     </Box>
//                 </Box>
//             )}

//             <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
//                 <DialogTitle>Create Process Flow</DialogTitle>
//                 <DialogContent>
//                     <Box mb={2}>
//                         <TextField
//                             label="Process Name"
//                             value={processName}
//                             onChange={handleProcessNameChange}
//                             fullWidth
//                             variant="outlined"
//                             margin="normal"
//                         />
//                     </Box>
//                     <FormControl fullWidth>
//                         <InputLabel id="operation-select-label">Select Operations</InputLabel>
//                         <Select
//                             labelId="operation-select-label"
//                             multiple
//                             value={selectedOperations}
//                             onChange={handleOperationChange}
//                             renderValue={(selected) => (
//                                 <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
//                                     {selected.map((value) => (
//                                         <Chip key={value} label={value} />
//                                     ))}
//                                 </Box>
//                             )}
//                         >
//                             {availableOperations.map((op) => (
//                                 <MenuItem key={op} value={op}>
//                                     {op}
//                                 </MenuItem>
//                             ))}
//                         </Select>
//                     </FormControl>
//                     {selectedOperations.length > 0 && (
//                         <Box mt={2}>
//                             <div>Drag and drop to arrange operation order:</div>
//                             <Box 
//                                 sx={{ 
//                                     background: '#f5f5f5', 
//                                     borderRadius: 2, 
//                                     p: 2, 
//                                     mt: 1,
//                                     minHeight: 100,
//                                     display: 'flex',
//                                     alignItems: 'center',
//                                     flexWrap: 'wrap',
//                                     gap: 1
//                                 }}
//                                 onDragOver={handleDragOver}
//                                 onDrop={(e) => handleDrop(e, selectedOperations.length)}
//                             >
//                                 {selectedOperations.map((op, idx) => (
//                                     <React.Fragment key={op}>
//                                         <Box
//                                             draggable
//                                             onDragStart={(e) => handleDragStart(e, op, idx)}
//                                             onDragEnd={handleDragEnd}
//                                             sx={{
//                                                 cursor: 'grab',
//                                                 '&:hover': { cursor: 'grabbing' },
//                                                 opacity: draggedItem?.index === idx ? 0.5 : 1
//                                             }}
//                                         >
//                                             <Chip 
//                                                 label={op} 
//                                                 color="primary"
//                                                 sx={{ 
//                                                     userSelect: 'none',
//                                                     '&:active': { cursor: 'grabbing' }
//                                                 }}
//                                             />
//                                         </Box>
//                                         {idx < selectedOperations.length - 1 && (
//                                             <Box
//                                                 onDragOver={handleDragOver}
//                                                 onDrop={(e) => handleDrop(e, idx + 1)}
//                                                 sx={{
//                                                     display: 'flex',
//                                                     alignItems: 'center',
//                                                     px: 1,
//                                                     '&:hover': { 
//                                                         background: 'rgba(25, 118, 210, 0.1)',
//                                                         borderRadius: 1
//                                                     }
//                                                 }}
//                                             >
//                                                 <ArrowForwardIcon sx={{ color: 'primary.main' }} />
//                                             </Box>
//                                         )}
//                                     </React.Fragment>
//                                 ))}
//                             </Box>
//                         </Box>
//                     )}
//                 </DialogContent>
//                 <DialogActions>
//                     <Button onClick={handleClose}>Cancel</Button>
//                     <Button onClick={handleSave} variant="contained" color="primary" disabled={!processName || selectedOperations.length === 0}>
//                         Save
//                     </Button>
//                 </DialogActions>
//             </Dialog>
//         </Container>
//     );
// };

// export default ProcessChartMaster;