const fs = require('fs');
const CredentialsStore = require('./credential-store');
const { BigQuery } = require('@google-cloud/bigquery');

var keyFileContents = fs.readFileSync('./keys.crd','utf8');
var credentialStore = new CredentialsStore(keyFileContents);

const bigquery = new BigQuery({
  keyFilename: './bq-account-key.json',
  projectId: credentialStore.getCredential('bigQueryProjectId'),
});

async function queryBigQuery() {
  const query = `
    SELECT url, SUM(screenpageviews) as views
    FROM mmap.ga4
    WHERE CONTAINS_SUBSTR(sessionsourcemedium, 'organic')
    GROUP BY url
    ORDER BY views DESC;
  `;

  const options = {
    query: query,
    useLegacySql: false, 
  };

  try {
    const [rows] = await bigquery.query(options);
    
    console.log('Query Results:');
    rows.forEach(row => console.log(row));
  } catch (err) {
    console.error('ERROR:', err);
  }
}

queryBigQuery();