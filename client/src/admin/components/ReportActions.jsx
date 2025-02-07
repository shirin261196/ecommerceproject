import React from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';

const ReportActions = ({ report, onDownloadPDF, onDownloadExcel }) => {
  if (!report) return null;

  return (
    <div className="mt-3">
      <h6>Actions</h6>
      <ButtonGroup>
        <Button variant="success" onClick={onDownloadPDF}>
          Download PDF
        </Button>
        <Button variant="warning" onClick={onDownloadExcel}>
          Download Excel
        </Button>
      </ButtonGroup>
    </div>
  );
};

export default ReportActions;
