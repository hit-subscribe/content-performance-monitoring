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
  //This query shows every URL in MMAP's GA4 that had at least 5 times as much traffic in the week before last as it did the past week
  // and that had at least 20 visitors 2 weeks ago.  This is an initial stab at "catstrophic traffic loss"
  const query = `
    SELECT 
    url,
    SUM(CASE WHEN DATE(date) BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL (7*2) DAY) AND DATE_SUB(CURRENT_DATE(), INTERVAL (7+1) DAY) THEN screenpageviews ELSE 0 END) AS older,
    SUM(CASE WHEN DATE(date) BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) AND CURRENT_DATE() THEN screenpageviews ELSE 0 END) AS most_recent,
    SUM(CASE WHEN DATE(date) BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL (7*2) DAY) AND DATE_SUB(CURRENT_DATE(), INTERVAL (7+1) DAY) THEN screenpageviews ELSE 0 END) - 
    	SUM(CASE WHEN DATE(date) BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) AND CURRENT_DATE() THEN screenpageviews ELSE 0 END) AS loss
FROM 
    mmap.ga4
  WHERE CONTAINS_SUBSTR(sessionsourcemedium, 'organic')
GROUP BY url
HAVING older > 5 * most_recent AND older > 20
ORDER BY loss DESC
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