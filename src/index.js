const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { BigQuery } = require('@google-cloud/bigquery');

const app = express();
// Cloud Run dynamically assigns a port; default to 8080 for local testing
const port = process.env.PORT || 8080; 

app.use(cors());
app.use(bodyParser.json());

// Initialize BigQuery using the identity of the Cloud Run Service Account
const bigquery = new BigQuery({
  projectId: 'gudayaswanth-devops'
});

app.get('/api/mounika', async (req, res) => {
  try {
    // 1. Fetch metadata from the NEW _test table structure
    const [metadata] = await bigquery
      .dataset('metrics_vault_test')
      .table('user_kpi_stats_test')
      .getMetadata();

    const columnNames = metadata.schema.fields
      .map(field => field.name)
      .filter(name => name.toLowerCase() !== 'name');

    // 2. Query for the specific record in the test table
    const sql = `
      SELECT ${columnNames.join(', ')}
      FROM \`gudayaswanth-devops.metrics_vault_test.user_kpi_stats_test\`
      WHERE LOWER(Name) LIKE '%mounika%'
      LIMIT 1
    `;

    const [rows] = await bigquery.query({ query: sql, location: 'US' });
    
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Data not found' });
    }

    const row = rows[0];

    // 3. Format values and labels for the Angular frontend
    const values = columnNames.map(col => {
      const val = row[col];
      return val === null || val === undefined ? 0 : Number(val);
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

// Explicitly listen on 0.0.0.0 for Cloud Run accessibility
app.listen(port, '0.0.0.0', () => {
  console.log(`Backend listening on port ${port}`);
});
