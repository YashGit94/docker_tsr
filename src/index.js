const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { BigQuery } = require('@google-cloud/bigquery');

const app = express();
const port = process.env.PORT || 8080; 

app.use(cors());
app.use(bodyParser.json());

// Initialize BigQuery using Cloud Run Identity for project gudayaswanth-devops
const bigquery = new BigQuery({
  projectId: 'gudayaswanth-devops'
});

app.get('/api/mounika', async (req, res) => {
  try {
    // 1. Fetch metadata from the NEW _test table
    const [metadata] = await bigquery
      .dataset('metrics_vault_test')
      .table('user_kpi_stats_test')
      .getMetadata();

    const columnNames = metadata.schema.fields
      .map(field => field.name)
      .filter(name => name.toLowerCase() !== 'name');

    // 2. Query the specific test table
    const sql = `
      SELECT ${columnNames.join(', ')}
      FROM \`gudayaswanth-devops.metrics_vault_test.user_kpi_stats_test\`
      WHERE LOWER(Name) LIKE '%mounika%'
      LIMIT 1
    `;

    const [rows] = await bigquery.query({ query: sql, location: 'US' });
    
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Mounika not found' });
    }

    const row = rows[0];
    const values = columnNames.map(col => Number(row[col] || 0));
    const labels = columnNames.map(col => 
      col.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    );

    res.json({ labels, values, raw: row });

  } catch (err) {
    console.error('BigQuery error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Backend listening on port ${port}`);
});
