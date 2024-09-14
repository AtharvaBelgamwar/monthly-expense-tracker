import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Typography } from '@mui/material';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const SpendingChart = ({ expenses }) => {
  // Getting unique categories from the expenses
  const categories = [...new Set(expenses.map(expense => expense.category))];

  // Data for the Pie chart
  const data = {
    labels: categories,
    datasets: [
      {
        label: 'Spending by Category',
        data: categories.map(
          category => expenses
            .filter(expense => expense.category === category)
            .reduce((total, expense) => total + expense.amount, 0)
        ),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ],
        hoverBackgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ]
      }
    ]
  };

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Spending by Category
      </Typography>
      <Pie data={data} />
    </div>
  );
};

export default SpendingChart;
