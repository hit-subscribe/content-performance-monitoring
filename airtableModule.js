require('dotenv').config();
const Airtable = require('airtable');

const baseID = process.env.AIRTABLE_CURRENT_BASE;
const apiKey = process.env.AIRTABLE_API_KEY;

// Fetch all records from the "URLs" table
function fetchAllURLs() {
  return new Promise((resolve, reject) => {
    const base = new Airtable({ apiKey }).base(baseID);
    const recordsData = [];

    base('URLs').select({

    }).eachPage(
      (records, fetchNextPage) => {
        records.forEach((record) => {
          recordsData.push({
            id: record.id,
            URLs: record.get('URLs')
          });
        });
        fetchNextPage();
      },
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(recordsData);
        }
      }
    );
  });
}

// Fetch all records from the "Keywords" table
function fetchAllKeywords() {
  return new Promise((resolve, reject) => {
    const base = new Airtable({ apiKey }).base(baseID);
    const recordsData = [];

    base('Keywords').select({
    
    }).eachPage(
      (records, fetchNextPage) => {
        records.forEach((record) => {
          recordsData.push({
            id: record.id,
            Keyword: record.get('Keyword')
          });
        });
        fetchNextPage();
      },
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(recordsData);
        }
      }
    );
  });
}

// Create a new record in the "Keywords" table
function createKeywordRecord(keyword) {
  return new Promise((resolve, reject) => {
    const base = new Airtable({ apiKey }).base(baseID);

    base('Keywords').create([
      {
        fields: {
          Keyword: keyword
        }
      }
    ], (err, records) => {
      if (err) {
        reject(err);
      } else {
        resolve(records[0]);
      }
    });
  });
}

module.exports = { fetchAllURLs, fetchAllKeywords, createKeywordRecord };
