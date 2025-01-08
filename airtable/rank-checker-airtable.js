const fs = require('fs');
const axios = require('axios');
const Serp = require('./serp');
const Airtable = require('airtable');
require('dotenv').config();

const CredentialsStore = require('./credential-store');

var keyFileContents = fs.readFileSync('./keys.crd','utf8');
var credentialStore = new CredentialsStore(keyFileContents);

var dataForSeoUsername = credentialStore.getCredential('dataForSeoUsername');
var dataforSeoPassword = credentialStore.getCredential('dataForSeoPassword');


// Hate doing this up here. Need to refactor someday.
const { Command } = require('commander');
const program = new Command();

// Define command line args
program
.name('rank-checker-airtable')
.description('Pull URLS from Airtable. Get rank. Add to new table.')
.version('0.5.0')
.option('-a, --api-key <key>', 'Airtable API Key')
.option('-b, --base-id <id>', 'Airtable Base ID')

// Parse them
program.parse();


// Command line beats env file
baseId = "not defined";
apiKey = "not defined";
tableName = "not defined";
urlColumn = "not defined";
keyColumn = "not defined";

const URLfieldName = 'URLs';
const URLtableName = 'URLs';
const KeyfieldName = 'Keyword Text';


if (typeof program.opts().apiKey !== 'undefined') {
  apiKey = program.opts().apiKey;
  console.log("Using api key from command line.");
} else {
  console.log("Using api key from env file.");
  apiKey = process.env.AIRTABLE_API_KEY;
}

if (typeof program.opts().baseId !== 'undefined') {
  console.log("Using base id from command line.");
  baseId = program.opts().baseId;
} else {
  console.log("Using base id from env file.");
  baseId = process.env.AIRTABLE_CURRENT_BASE;
}

const base = new Airtable({ apiKey: apiKey }).base(baseId);

let keyTable = base("Keywords");


const getUrls = async () => {
    console.log('Fetching URLs from Airtable...');
    const records = [];
    return new Promise((resolve, reject) => {
      base(URLtableName).select({
        pageSize: 100
      }).eachPage(
        (pageRecords, fetchNextPage) => {
          pageRecords.forEach((record) => {
            let keyword = record.get(KeyfieldName);
            if (typeof(keyword) !== 'undefined') {
              const item = {URL:record.get(URLfieldName), keyword:keyword, rank:"1000"};
              records.push(item);
            }
          });
          fetchNextPage();
        },
        (err) => {
          if (err) {
            console.error('Error fetching URLs from Airtable:', err);
            reject(err);
          } else {
            console.log(`Fetched ${records.length} existing URLs from Airtable.`);
            resolve(records);
          }
        }
      );
    });
  };
  


function getRankSafely(serp, url) {
    try {
        return serp.getRankOfUrl(url);
    } catch (error) {
        return 100; // Set rank to 100 if an exception is thrown
    }
}


function getDataForSeoResults(urlList) {
    let results = [];
    let requests = [];

    
    for (let i = 0; i < urlList.length; i += 1) {

      let entry = urlList[i];

          const postRequest = {
              method: 'post',
              url: 'https://api.dataforseo.com/v3/serp/google/organic/live/regular',
              auth: {
                  username: dataForSeoUsername,
                  password: dataforSeoPassword
              },
              data: [{
                  "keyword": encodeURIComponent(entry.keyword),
                  "language_code": "en",
                  "location_code": 2840
              }],
              headers: {
                  'content-type': 'application/json'
              }
          };

          let request = axios(postRequest).then(function (response) {

              var result = response['data']['tasks'];
              var serp = new Serp(result);
              entry.rank = getRankSafely(serp,entry.URL);

              console.log(entry);
              results.push(entry);



          }).catch(function (error) {
              console.log(error);
          });
          requests.push(request);

    }


    Promise.all(requests).then(() => {
      for (let i = 0; i < results.length; i += 1) {
        console.log(results[i]);
      }
    });

}


const main = async () => {
    console.log('Starting URL rank processing...');


    const urlsToRank = await getUrls();
    getDataForSeoResults(urlsToRank);

    
  }  
  main();
  