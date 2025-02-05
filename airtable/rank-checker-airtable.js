import Serp from './serp.js';
import Airtable from 'airtable';
import CredentialsStore from 'credential-store';
import axios from 'axios';
import fs from 'fs';
import log from 'loglevel';

import Configurator from 'configurator';

let properties = [];
properties.push({name: 'apikey', argument: 'a', help: 'Airtable API Key', envName:'AIRTABLE_API_KEY' })
properties.push({name: 'baseid', argument: 'b', help: 'Airtable Base ID', envName: 'AIRTABLE_CURRENT_BASE' })

var configurator = new Configurator("rank-checker-airtable", "Pull URLS from Airtable. Get rank. Add to new table.",
   "0.2.0", properties);

var keyFileContents = fs.readFileSync('./keys.crd','utf8');
var credentialStore = new CredentialsStore(keyFileContents);

var dataForSeoUsername = credentialStore.getCredential('dataForSeoUsername');
var dataforSeoPassword = credentialStore.getCredential('dataForSeoPassword');
   

const base = new Airtable({ apiKey: configurator.configuration["apikey"] }).base(configurator.configuration["baseid"]);
let urlTable = base("URLs");

//Constants
let DefaultRank = "100";
let URLTableName = "Ranking Results";


// Airtable Field Names
let URLFieldName = "URLs";
let KeyFieldName = "Keyword Text";
let NewKeyFieldName = "Keywords"
let RankFieldName = "Number";
let DateFieldName = "Measurement Date";


let results = [];

var date = new Date();
let today = date.toISOString();


const getUrls = async () => {
    log.info('Fetching URLs from Airtable...');
    const records = [];
    return new Promise((resolve, reject) => {
      urlTable.select({
        pageSize: 100
      }).eachPage(
        (pageRecords, fetchNextPage) => {
          pageRecords.forEach((record) => {
            let keyword = record.get(KeyFieldName);
            if (typeof(keyword) !== 'undefined') {
              const item = {URLs:record.get(URLFieldName), Keywords:keyword, Number:DefaultRank};
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
            log.info(`Fetched ${records.length} existing URLs from Airtable.`);
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

function getDataForSeoResults(urlsToRank) {
  let requests = [];

  urlsToRank.forEach((entry, entryIndex) => {
      const postRequest = {
          method: 'post',
          url: 'https://api.dataforseo.com/v3/serp/google/organic/live/regular',
          auth: {
              username: dataForSeoUsername,
              password: dataforSeoPassword
          },
          data: [{
              "keyword": encodeURIComponent(entry.Keywords),
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
          entry.Number = getRankSafely(serp, entry.URLs);

      }).catch(function (error) {
          log.info(error);
      });

      requests.push(request);
      
  })

  Promise.all(requests).then(async () => {
    log.info("Finished getting ranks!");
    await addNewRecords(urlsToRank);

  });
}

const addNewRecords = async (entries) => {
  log.info(`Adding ${entries.length} new URLs to Airtable...`);
  const BATCH_SIZE = 10;


  const recordsToAdd = entries.map(({ URLs, Keywords, Number }) => ({
    fields: {
      [URLFieldName]: URLs,
      [NewKeyFieldName]: Keywords,
      [RankFieldName]: Number,
      [DateFieldName]: today
    }
  }));

  for (let i = 0; i < recordsToAdd.length; i += BATCH_SIZE) {
    const batch = recordsToAdd.slice(i, i + BATCH_SIZE);
    try {
      await base(URLTableName).create(batch, { typecast: true });
      log.info(`Batch ${i / BATCH_SIZE + 1}: Added ${batch.length} records to Airtable.`);
    } catch (error) {
      log.error(`Error adding batch ${i / BATCH_SIZE + 1}:`, error);
    }
  }
  log.info('Finished adding new URLs to Airtable.');
};

const main = async () => {
    log.info('Starting URL rank processing...');

    const urlsToRank = await getUrls();
    const results = await getDataForSeoResults(urlsToRank);    
  }  

  main();
  