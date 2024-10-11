const fs = require('fs');
const CredentialsStore = require('./credential-store');
const { BigQuery } = require('@google-cloud/bigquery');
const path = require('path');
var keyFileContents = fs.readFileSync('./keys.crd', 'utf8');
var credentialStore = new CredentialsStore(keyFileContents);



async function queryUrlsWithPercentageDecrease(client, percentageDecrease, days) {
  const sqlFilePath = path.join(__dirname, 'SQL Scripts', 'queries','traffic-decrease.sql');
  const query = fs.readFileSync(sqlFilePath, 'utf8');

  console.log(sqlFilePath)
  const options = {
    query: query,
    params: {
      'percentage_decrease': percentageDecrease,
      'days': days,
      'floor': floor
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
const percentageDecrease = 20; // Adjust the percentage decrease as needed
const days = 14; // Adjust the number of days as needed
const floor = 10; //the minimum "old" traffic, must be above 0

queryUrlsWithPercentageDecrease(bigquery, percentageDecrease, days)
  .then(results => {
    console.log(results);
  })
  .catch(err => {
    console.error('Error:', err);
  });
