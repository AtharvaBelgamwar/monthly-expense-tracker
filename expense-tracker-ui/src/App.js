import React, { useState, useEffect } from 'react';
import Login from './components/login';
import Register from './components/resgister';
import AddExpense from './components/add_expense';
import ExpenseList from './components/expenselist';
import MonthlyReport from './components/monthly_report';
import SpendingChart from './components/spending_chart'; // Import SpendingChart
import './App.css';
import { Container, Grid, Typography, Button } from '@mui/material';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      setToken(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <Container maxWidth="md">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" align="center">
            Monthly Expense Tracker
          </Typography>
        </Grid>

        {!token ? (
          <>
            <Grid item xs={12} sm={6}>
              <Register />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Login setToken={setToken} />
            </Grid>
          </>
        ) : (
          <>
            <Grid item xs={12}>
              <AddExpense token={token} />
            </Grid>
            <Grid item xs={12}>
              <ExpenseList token={token} setExpenses={setExpenses} expenses={expenses} />
            </Grid>
            <Grid item xs={12}>
              <MonthlyReport token={token} expenses={expenses} />
            </Grid>

            {/* Adding SpendingChart */}
            <Grid item xs={12}>
              <SpendingChart expenses={expenses} />
            </Grid>

            <Grid item xs={12}>
              <Button variant="contained" color="secondary" onClick={handleLogout}>
                Logout
              </Button>
            </Grid>
          </>
        )}
      </Grid>
    </Container>
  );
}

export default App;
