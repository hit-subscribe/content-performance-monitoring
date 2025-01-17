import Serp from './serp.js';
import Airtable from 'airtable';

import Configurator from 'configurator';


let properties = [];
properties.push({name: 'apikey', argument: 'a', help: 'Airtable API Key', envName:'AIRTABLE_API_KEY' })
properties.push({name: 'baseid', argument: 'b', help: 'Airtable Base ID', envName: 'AIRTABLE_CURRENT_BASE' })

var configurator = new Configurator("rank-checker-airtable", "Pull URLS from Airtable. Get rank. Add to new table.",
   "0.2.0", properties);

const base = new Airtable({ apiKey: configurator.configuration["apikey"] }).base(configurator.configuration["baseid"]);
let urlTable = base("URLs");
let KeyfieldName = "Keyword Text";
let URLfieldName = "URLs";


const getUrls = async () => {
    console.log('Fetching URLs from Airtable...');
    const records = [];
    return new Promise((resolve, reject) => {
      urlTable.select({
        pageSize: 100
      }).eachPage(
        (pageRecords, fetchNextPage) => {
          pageRecords.forEach((record) => {
            let keyword = record.get(KeyfieldName);
            if (typeof(keyword) !== 'undefined') {
              const item = {URL:record.get("URLs"), Keywords:keyword, Number:"1000"};
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


const  getDataForSeoResults = async (urlList) => {
    let results = [];
    let serps = [];

    urlList.forEach(entry => {
      var serp = Serp.getSERPForKeyword(entry.keyword);
      serp.then(function (serp) {
        entry.number = getRankSafely(serp, entry.URL);
        addRankingResult(entry);
        results.push(entry);
      });
      serps.push(serp);
    });

    Promise.all(serps).then(() => { });

    console.log("Done getting ranks "+ results.length);

    return results;
}

const addRankingResult = async(entry) => {

  var batch = [];

  const recordsToAdd = {
    fields: {
      "URLs": entry.URL,
      "Keywords": entry.Keywords,
      "Number": entry.Number


Add today for measurement

    }
  }
  batch.push(recordsToAdd);

    try {
      await base("Ranking Results").create(batch, { typecast: true });
    } catch (error) {
      console.error(`Error adding batch`, error);
    }
  
};


const main = async () => {
    console.log('Starting URL rank processing...');


    const urlsToRank = await getUrls();
    const results = await getDataForSeoResults(urlsToRank);

    //console.log("Ready to add!");

    //await addRankingResults(results);

    
  }  
  main();
  