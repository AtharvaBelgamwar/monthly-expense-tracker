import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';

const AddExpense = ({ token }) => {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
  
    try {
      const response = await fetch('http://localhost:5000/expense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Ensure the token is passed in the Authorization header
        },
        body: JSON.stringify({
          category,
          amount: parseFloat(amount), // Convert amount to a number
          date,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to add expense');
      }
  
      alert('Expense added successfully');
      
      // Clear the form fields after successful submission
      setCategory('');
      setAmount('');
      setDate('');
    } catch (err) {
      setError(err.message); // Set the error message for display
    }
  };

  return (
    <Box component="form" onSubmit={handleAddExpense} sx={{ mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        Add Expense
      </Typography>
      {error && <Typography color="error">{error}</Typography>} {/* Display error */}
      <TextField
        label="Category"
        variant="outlined"
        fullWidth
        margin="normal"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      <TextField
        label="Amount"
        variant="outlined"
        type="number"
        fullWidth
        margin="normal"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <TextField
        label="Date"
        variant="outlined"
        type="date"
        fullWidth
        margin="normal"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <Button type="submit" variant="contained" color="primary" fullWidth>
        Add Expense
      </Button>
    </Box>
  );
};

export default AddExpense;
