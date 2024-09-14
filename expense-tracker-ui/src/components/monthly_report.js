import React from 'react';
import { Typography } from '@mui/material';

const MonthlyReport = ({ expenses }) => {
  if (!Array.isArray(expenses) || expenses.length === 0) {
    return <Typography variant="body1">No expenses to show.</Typography>; // Handle empty state
  }

  const totalSpent = expenses.reduce((acc, expense) => acc + expense.amount, 0);

  return (
    <div>
      <Typography variant="h5">Monthly Report</Typography>
      <Typography variant="body1">Total Spent: ${totalSpent}</Typography>
    </div>
  );
};

export default MonthlyReport;
