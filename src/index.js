const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { BigQuery } = require('@google-cloud/bigquery');

const SCOPES = [
  'https://www.googleapis.com/auth/bigquery',
  'https://www.googleapis.com/auth/drive.readonly'
];

const app = express();

// Cloud Run dynamically assigns a port via the PORT environment variable.
// We bind to 0.0.0.0 to ensure the container is reachable by the proxy.
const port = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());

/**
 * FIX: No local keys required. 
 * By leaving the configuration object mostly empty, the library 
 * automatically uses the Cloud Run Service Account's identity.
 */
const bigquery = new BigQuery({
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

app.listen(port, '0.0.0.0', () => {
  console.log(`Backend listening on port ${port}`);
});
