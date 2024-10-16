const fs = require('fs');
const CredentialsStore = require('./credential-store');
const { BigQuery } = require('@google-cloud/bigquery');
const path = require('path');
var keyFileContents = fs.readFileSync('./keys.crd', 'utf8');
var credentialStore = new CredentialsStore(keyFileContents);



async function queryUrlsWithPercentageDecrease(client, percentageDecrease, days) {
  const sqlFilePath = path.join(__dirname, 'SQL Scripts', 'queries', 'zero-alert.sql');
  const query = fs.readFileSync(sqlFilePath, 'utf8');

  console.log(sqlFilePath)
  const options = {
    query: query,
    params: {
      'min_zero_days': minZeroDays,
      'days_with_traffic': daysWithTraffic
    },
  };

  console.log(options)

  const [rows] = await client.query(options);
  console.log('Query Results:');
  rows.forEach(row => console.log(row));
  //return rows;
}

// Usage example:
const bigquery = new BigQuery({
  keyFilename: './bq-account-key.json',
  projectId: credentialStore.getCredential('bigQueryProjectId'),
});

const minZeroDays = 1;
const daysWithTraffic = 1;
queryUrlsWithPercentageDecrease(bigquery)
  .then(results => {
    console.log(results);
  })
  .catch(err => {
    console.error('Error:', err);
  });
