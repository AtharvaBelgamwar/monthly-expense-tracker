import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Typography } from '@mui/material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'; // Import necessary components

// Register the chart components
ChartJS.register(ArcElement, Tooltip, Legend);

const SpendingChart = ({ expenses }) => {
  const categories = [...new Set(expenses.map(expense => expense.category))];

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
