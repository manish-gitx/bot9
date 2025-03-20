const express = require('express');
const path = require('path');
const chatService = require('./backend/service/chatService');
const cron = require('node-cron');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Schedule task to run every 8 minutes
cron.schedule('*/8 * * * *', async () => {
  try {
    console.log(`Pinging bot9-5hfw.onrender.com at ${new Date().toISOString()}`);
    const response = await axios.get('https://bot9-5hfw.onrender.com');
    console.log(`Ping successful: Status ${response.status}`);
  } catch (error) {
    console.error('Error pinging the website:', error.message);
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/chat', chatService);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Cron job started - pinging bot9-5hfw.onrender.com every 8 minutes');
});


