const express = require('express');
const app = express();

// Cloud Run provides the port; we must use it and bind to 0.0.0.0
const port = process.env.PORT || 8080;

// Health Check Route (Required for Cloud Run to see the app is alive)
app.get('/', (req, res) => {
  res.status(200).send('Backend is Up and Running!');
});

// Mock Data Endpoint (Matches your frontend call)
app.get('/api/mounika', (req, res) => {
  console.log('Received request for Mounika data - Sending Sample Data');
  
  const sampleData = {
    labels: [
      "Security Command Center", 
      "Cloud Asset Inventory", 
      "VPC Service Controls", 
      "Cloud Armor", 
      "Binary Authorization", 
      "Cloud Key Management Service"
    ],
    values: [85, 90, 75, 80, 95, 88]
  };

  res.json(sampleData);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Test Backend listening on port ${port}`);
});
