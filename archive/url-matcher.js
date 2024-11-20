
const csvFilePath = 'csv/keyword-match.csv'; // Update with your CSV file path

const fs = require('fs');
const csv = require('csv-parser');
const Airtable = require('airtable');
require('dotenv').config();

// Configure Airtable
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

const URLtableName = 'URLs';
// Configuration for field names
const csvFields = {
  url: 'URLs',
  score: 'Score',
  title: 'Title',
  keywords: 'Keywords'
};

const airtableFields = {
  url: 'URL', // Field in the "URLs" table
  keyword: 'Keyword', // Field in the "Keywords" table
  linkedUrl: 'URL' // Field to link to the "URLs" table in "Keywords"
};


const loadAllUrlRecords = async () => {
  console.log('Fetching existing URLs from Airtable...');
  const records = [];
  return new Promise((resolve, reject) => {
    base(URLtableName).select({
      pageSize: 100
    }).eachPage(
      (pageRecords, fetchNextPage) => {
        pageRecords.forEach((record) => {
          records.push(record.get(URLtableName));
        });
        fetchNextPage();
      },
      (err) => {
        if (err) {
          console.error('Error fetching existing URLs from Airtable:', err);
          reject(err);
        } else {
          console.log(`Fetched ${records.length} existing URLs from Airtable.`);
          resolve(records);
        }
      }
    );
  });
};

async function processCSV() {
  try {
    const allUrlRecords = await loadAllUrlRecords();
    const records = [];

    // Read the CSV file
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (data) => {
        records.push(data);
      })
      .on('end', async () => {
      /*  for (const record of records) {
          await handleRecord(record, allUrlRecords);
        }*/
        console.log('Processing complete.');
      })
      .on('error', (error) => {
        console.error("Error reading CSV file:", error);
      });
  } catch (error) {
    console.error("Error in processCSV:", error);
  }
}

async function handleRecord(record, allUrlRecords) {
  const urlToFind = record[csvFields.url];

  try {
    // Find matching record in loaded URL records
    const matchingRecord = allUrlRecords.find(urlRecord => urlRecord.url === urlToFind);

    if (matchingRecord) {
      // Create a new record in the "Keywords" table
      const keywordRecord = await base('Keywords').create([
        {
          fields: {
            [airtableFields.keyword]: record[csvFields.keywords],
            [airtableFields.linkedUrl]: [matchingRecord.id] // Linking to the matched URL record
          }
        }
      ]);
      console.log(`Created keyword record: ${keywordRecord.id} for URL: ${urlToFind}`);
    } else {
      console.log(`No match found for URL: ${urlToFind}`);
    }
  } catch (error) {
    console.error(`Error processing record for URL ${urlToFind}:`, error);
  }
}

// Start processing the CSV file
processCSV();

