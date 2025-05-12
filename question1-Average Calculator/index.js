const express = require('express');
const axios = require('axios');
const app = express();
const port = 9876;

const windowSize = 10;
let window = [];

const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ3MDMwNjkwLCJpYXQiOjE3NDcwMzAzOTAsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjkyMTBlYmVkLTFhMGYtNGIyYS1hNGQyLTExNDg4Y2E4Yjg4OSIsInN1YiI6ImFqYXltLjIyY3NlQGtvbmd1LmVkdSJ9LCJlbWFpbCI6ImFqYXltLjIyY3NlQGtvbmd1LmVkdSIsIm5hbWUiOiJhamF5IG0iLCJyb2xsTm8iOiIyMmNzcjAwOSIsImFjY2Vzc0NvZGUiOiJqbXBaYUYiLCJjbGllbnRJRCI6IjkyMTBlYmVkLTFhMGYtNGIyYS1hNGQyLTExNDg4Y2E4Yjg4OSIsImNsaWVudFNlY3JldCI6IkdBQlVEQ2R2aEpEam1YTVEifQ.rIBzH9DjR7Ce8XO2uBN7bxRqRYY3V9Wex37e1QBGqVs"; 

async function fetchNumbers(type) {
  const apiUrls = {
    p: 'http://20.244.56.144/evaluation-service/primes',
    f: 'http://20.244.56.144/evaluation-service/fibo',
    e: 'http://20.244.56.144/evaluation-service/even',
    r: 'http://20.244.56.144/evaluation-service/rand'
  };

  try {
    const response = await axios.get(apiUrls[type], {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
      },
      timeout: 500,
    });
    return response.data.numbers;
  } catch (error) {
    console.error('Error fetching numbers:', error.message);

    if (error.response) {
      console.error('Server responded with:', error.response.status);
    } else if (error.request) {
      console.error('No response received:', error.request);
    }

    return []; 
  }
}

function calculateAverage(numbers) {
  if (numbers.length === 0) return 0; 
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return (sum / numbers.length).toFixed(2); 
}

app.get('/numbers/:numberid', async (req, res) => {
  const numberId = req.params.numberid;


  if (!['p', 'f', 'e', 'r'].includes(numberId)) {
    return res.status(400).json({ error: 'Invalid number ID' });
  }

  const numbers = await fetchNumbers(numberId);


  if (numbers.length === 0) {
    return res.status(500).json({
      windowPrevState: window,
      windowCurrState: window,
      numbers: [],
      avg: calculateAverage(window)
    });
  }

  const newNumbers = [...new Set([...window, ...numbers])];

  if (newNumbers.length > windowSize) {
    newNumbers.splice(0, newNumbers.length - windowSize); 
  }

  
  const avg = calculateAverage(newNumbers);

  const response = {
    windowPrevState: window, 
    windowCurrState: newNumbers, 
    numbers: numbers, 
    avg: parseFloat(avg) 
  };

  window = newNumbers; 
  res.json(response);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
