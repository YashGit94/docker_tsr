const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { BigQuery } = require('@google-cloud/bigquery');

const app = express();

/** * CRITICAL FIX 1: Use process.env.PORT. 
 * Cloud Run injects this variable. Defaulting to 8080 for local safety.
 */
const port = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());

const bigquery = new BigQuery({
  projectId: 'gudayaswanth-devops'
});

app.get('/api/mounika', async (req, res) => {
  try {
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
      return res.status(200).json({ labels: [], values: [], message: 'No data' });
    }

    const row = rows[0];
    const values = columnNames.map(col => Number(row[col] || 0));
    const labels = columnNames.map(col => 
      col.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    );

    res.json({ labels, values });
  } catch (err) {
    console.error('BigQuery Error:', err);
    res.status(500).json({ error: err.message });
  }
});

/** * CRITICAL FIX 2: Bind to '0.0.0.0'.
 * Listening on 'localhost' inside a container makes it unreachable from outside.
 */
app.listen(port, '0.0.0.0', () => {
  console.log(`Backend is live on port ${port}`);
});
