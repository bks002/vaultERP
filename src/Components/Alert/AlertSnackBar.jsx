import React from 'react';
import { Snackbar, Alert } from '@mui/material';

const AlertSnackbar = ({ open, type, message, onClose }) => (
    <Snackbar open={open} autoHideDuration={3000} onClose={onClose}>
        <Alert severity={type} variant="filled" onClose={onClose}>
            {message}
        </Alert>
    </Snackbar>
);

export default AlertSnackbar;
