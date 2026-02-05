const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { BigQuery } = require('@google-cloud/bigquery');

const SCOPES = [
  'https://www.googleapis.com/auth/bigquery',
  'https://www.googleapis.com/auth/drive.readonly'
];
const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

const bigquery = new BigQuery({
  // CRITICAL: JSON.parse converts the environment string back into a JavaScript object
  credentials: JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY),
  projectId: 'elevate360-poc',
  scopes: SCOPES,
});
// returns one row for Mounika (adjust LIKE if full name differs)

app.get('/api/mounika', async (req, res) => {
  try {
    // First get the table schema to get exact column names in order
    const [metadata] = await bigquery
      .dataset('ttp_metrics')
      .table('security')
      .getMetadata();

    // Extract column names from schema, excluding 'Name'
    const columnNames = metadata.schema.fields
      .map(field => field.name)
      .filter(name => name.toLowerCase() !== 'name');

    // Build the SQL query using the column names
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

    // Map the values in same order as column names
    const values = columnNames.map(col => {
      const val = row[col];
      return val === null || val === undefined ? null : Number(val);
    });

    // Format labels for display (replace underscores with spaces)
    const labels = columnNames.map(col => 
      col.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    );

    res.json({
      labels,    // ['Security Command Center', 'Cloud Asset Inventory', ...]
      values,    // [84.0, 86.0, 94.0, 80.0, 87.0, 83.0]
      raw: row   // original row data if needed
    });

  } catch (err) {
    console.error('BigQuery error:', err);
    res.status(500).json({ error: err.message });
  }
});


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`backend listening on ${port}`));
