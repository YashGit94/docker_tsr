const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { BigQuery } = require('@google-cloud/bigquery');

const app = express();
const port = process.env.PORT || 8080; // Required for Cloud Run

app.use(cors());
app.use(bodyParser.json());

const bigquery = new BigQuery({
  projectId: 'gudayaswanth-devops'
});

app.get('/api/mounika', async (req, res) => {
  try {
    // Graceful check for the test table structure
    const [metadata] = await bigquery
      .dataset('metrics_vault_test')
      .table('user_kpi_stats_test')
      .getMetadata();

    const columnNames = metadata.schema.fields
      .map(field => field.name)
      .filter(name => name.toLowerCase() !== 'name');

    const sql = `
      SELECT ${columnNames.join(', ')}
      FROM \`gudayaswanth-devops.metrics_vault_test.user_kpi_stats_test\`
      WHERE LOWER(Name) LIKE '%mounika%'
      LIMIT 1
    `;

    const [rows] = await bigquery.query({ query: sql, location: 'US' });
    
    if (!rows || rows.length === 0) {
      return res.status(200).json({ labels: [], values: [], message: 'Mounika record missing' });
    }

    const row = rows[0];
    const values = columnNames.map(col => Number(row[col] || 0));
    const labels = columnNames.map(col => 
      col.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    );

    res.json({ labels, values });

  } catch (err) {
    console.warn('BigQuery skip/error:', err.message);
    // Return empty success to prevent frontend crash during initial setup
    res.json({ labels: [], values: [], error: 'Table setup pending' });
  }
});

// CRITICAL FIX: Explicitly bind to 0.0.0.0 to satisfy Cloud Run health checks
app.listen(port, '0.0.0.0', () => {
  console.log(`Backend service listening on port ${port}`);
});
