import React, { useEffect, useState } from 'react';
import { Typography, CircularProgress } from '@mui/material';

const ExpenseList = ({ token, setExpenses, expenses }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      const response = await fetch('http://127.0.0.1:5000/expenses', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setExpenses(Array.isArray(data) ? data : []); // Ensure data is an array
      setLoading(false);
    };
    fetchExpenses();
  }, [token, setExpenses]);

  if (loading) {
    return <CircularProgress />;
  }

  if (!Array.isArray(expenses)) {
    return <div>No expenses available.</div>;
  }

  return (
    <div>
      <Typography variant="h5">Your Expenses</Typography>
      <ul>
        {expenses.map((expense) => (
          <li key={expense.id}>
            {expense.category} - ${expense.amount} on {expense.date}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExpenseList;
