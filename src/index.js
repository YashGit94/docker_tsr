const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { BigQuery } = require('@google-cloud/bigquery');

const SCOPES = [
  'https://www.googleapis.com/auth/bigquery',
  'https://www.googleapis.com/auth/drive.readonly'
];
const app = express();

app.use(cors());
app.use(bodyParser.json());

const bigquery = new BigQuery({
  // JSON.parse converts the environment string back into a JavaScript object
  credentials: JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY),
  projectId: 'elevate360-poc',
  scopes: SCOPES,
});

app.get('/api/mounika', async (req, res) => {
  try {
    const [metadata] = await bigquery
      .dataset('ttp_metrics')
      .table('security')
      .getMetadata();

    const columnNames = metadata.schema.fields
      .map(field => field.name)
      .filter(name => name.toLowerCase() !== 'name');

    const sql = `
      SELECT ${columnNames.join(', ')}
      FROM \`elevate360-poc.ttp_metrics.security\`
      WHERE LOWER(Name) LIKE '%mounika%'
      LIMIT 1
    `;

    const [rows] = await bigquery.query({ query: sql, location: 'US' });
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Mounika not found' });
    }

    const row = rows[0];
    const values = columnNames.map(col => {
      const val = row[col];
      return val === null || val === undefined ? null : Number(val);
    });

    const labels = columnNames.map(col => 
      col.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    );

    res.json({
      labels,
      values,
      raw: row
    });

  } catch (err) {
    console.error('BigQuery error:', err);
    res.status(500).json({ error: err.message });
  }
});

// IMPORTANT: Cloud Run requires listening on process.env.PORT
const port = process.env.PORT || 8080; 
app.listen(port, () => console.log(`Backend listening on port ${port}`));
