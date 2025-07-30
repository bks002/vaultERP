import React from 'react';
import { CSVLink } from 'react-csv';
import { Button } from '@mui/material';

const ExportCSVButton = ({ data, filename, headers }) => {
  return (
    <CSVLink
      data={data}
      filename={filename}
      headers={headers}
      style={{ textDecoration: 'none' }}
    >
      <Button variant="outlined" color="primary">
        Export to CSV
      </Button>
    </CSVLink>
  );
};

export default ExportCSVButton;
