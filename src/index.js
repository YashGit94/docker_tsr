const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { BigQuery } = require('@google-cloud/bigquery');

const app = express();

// FIX: Cloud Run provides the PORT environment variable. 
// It must listen on this port to pass the health check.
const port = process.env.PORT || 8080; 

app.use(cors());
app.use(bodyParser.json());

// Initializing without credentials triggers Application Default Credentials (ADC)
const bigquery = new BigQuery({
  projectId: 'elevate360-poc'
});

app.get('/api/mounika', async (req, res) => {
  try {
    const sql = `SELECT * FROM \`elevate360-poc.ttp_metrics.security\` WHERE LOWER(Name) LIKE '%mounika%' LIMIT 1`;
    const [rows] = await bigquery.query({ query: sql, location: 'US' });
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Mounika not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// FIX: Bind to 0.0.0.0 instead of localhost/127.0.0.1
app.listen(port, '0.0.0.0', () => {
  console.log(`Backend listening on port ${port}`);
});
