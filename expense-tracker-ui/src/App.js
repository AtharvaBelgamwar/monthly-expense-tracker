import React, { useState } from 'react';
import Login from './components/login';
import Register from './components/resgister';
import AddExpense from './components/add_expense';
import ExpenseList from './components/expenselist';
import MonthlyReport from './components/monthly_report';
import { Container, Grid, Button, Typography, CircularProgress } from '@mui/material';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));  // Get token from localStorage
  const [expenses, setExpenses] = useState([]);  // Define expenses state
  const [advice, setAdvice] = useState('');  // To store advice from Gemini API
  const [chartSrc, setChartSrc] = useState(null);  // To store the pie chart URL
  const [loadingAdvice, setLoadingAdvice] = useState(false);  // To track loading state for Gemini advice
  const [loadingChart, setLoadingChart] = useState(false);  // To track loading state for Pie Chart

  // Function to log out and clear the token
  const handleLogout = () => {
    localStorage.removeItem('token');  // Remove token from localStorage
    setToken(null);  // Clear token from state
  };

  // Fetch Pie Chart from the backend with loading state
  const getPieChart = async () => {
    setLoadingChart(true);  // Start loading animation for pie chart
    try {
      const response = await fetch('http://localhost:5000/pie_chart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`  // Pass token for authentication
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setChartSrc(url);  // Set the pie chart URL to display
      } else {
        console.error('Error fetching pie chart');
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoadingChart(false);  // Stop loading animation for pie chart
    }
  };

  // Fetch advice from Gemini API with loading state
  const getGeminiAdvice = async () => {
    setLoadingAdvice(true);  // Start loading animation for Gemini advice
    try {
      const response = await fetch('http://localhost:5000/gemini_advice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`  // Add token for authentication
        },
        body: JSON.stringify({ expenses })  // Send expenses list to the backend
      });

      const data = await response.json();
      if (response.ok) {
        setAdvice(data.advice);  // Store the advice
      } else {
        console.error('Error fetching advice:', data.error);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoadingAdvice(false);  // Stop loading animation for Gemini advice
    }
  };

  return (
    <Container maxWidth="md">
      <Grid container spacing={3}>
        {/* Title */}
        <Grid item xs={12}>
          <Typography variant="h4" align="center">
            Monthly Expense Tracker
          </Typography>
        </Grid>

        {/* Show Register/Login if token doesn't exist */}
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
            {/* Logout Button */}
            <Grid item xs={12} style={{ textAlign: 'right' }}>
              <Button variant="contained" color="secondary" onClick={handleLogout}>
                Logout
              </Button>
            </Grid>

            {/* Add Expense Component */}
            <Grid item xs={12}>
              <AddExpense token={token} />
            </Grid>

            {/* Display Expense List */}
            <Grid item xs={12}>
              <ExpenseList token={token} setExpenses={setExpenses} expenses={expenses} />
            </Grid>

            {/* Display Monthly Report */}
            <Grid item xs={12}>
              <MonthlyReport token={token} expenses={expenses} />
            </Grid>

            {/* Button to Get Pie Chart */}
            <Grid item xs={12}>
              <Button variant="contained" color="primary" onClick={getPieChart} disabled={loadingChart}>
                {loadingChart ? 'Generating Pie Chart...' : 'View Spending Pie Chart'}
              </Button>
            </Grid>

            {/* Show Loading Spinner for Pie Chart */}
            {loadingChart && (
              <Grid item xs={12} style={{ textAlign: 'center' }}>
                <CircularProgress />
              </Grid>
            )}

            {/* Display the Pie Chart */}
            {chartSrc && (
              <Grid item xs={12}>
                <img src={chartSrc} alt="Spending by Category Pie Chart" style={{ width: '100%' }} />
              </Grid>
            )}

            {/* Button to Get Suggestions from Gemini */}
            <Grid item xs={12}>
              <Button variant="contained" color="primary" onClick={getGeminiAdvice} disabled={loadingAdvice}>
                {loadingAdvice ? 'Getting Suggestions...' : 'Get Suggestions to Improve Savings'}
              </Button>
            </Grid>

            {/* Show Loading Spinner for Suggestions */}
            {loadingAdvice && (
              <Grid item xs={12} style={{ textAlign: 'center' }}>
                <CircularProgress />
              </Grid>
            )}

            {/* Display the Advice from Gemini */}
            {advice && !loadingAdvice && (
              <Grid item xs={12}>
                <Typography variant="h6" color="secondary" style={{ marginTop: '20px' }}>
                  Advice from Gemini: {advice}
                </Typography>
              </Grid>
            )}
          </>
        )}
      </Grid>
    </Container>
  );
}

export default App;
