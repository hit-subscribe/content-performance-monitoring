// Utility functions for working with Airtable


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
// Function to create a keyword record with validation
// Modify the createKeywordRecord function to handle an object with both Keyword and Difficulty
// Modify the createKeywordRecord function to ensure Difficulty is a valid number
async function createKeywordRecord(keywordObj) {
  // Extract Keyword and Difficulty (if available) from the passed object
  const keyword = keywordObj.Keyword;
  let difficulty = keywordObj.Difficulty;

  // Ensure the keyword is a string and trim any excess spaces
  const cleanKeyword = typeof keyword === 'string' ? keyword.trim() : '';

  // Validate that the keyword is not empty
  if (!cleanKeyword) {
    throw new Error("Keyword cannot be empty.");
  }

  // Convert Difficulty to a number if it's provided
  if (difficulty) {
    difficulty = parseFloat(difficulty); // Convert to a number
    if (isNaN(difficulty)) {
      throw new Error("Difficulty must be a valid number.");
    }
  }

  return new Promise((resolve, reject) => {
    const base = new Airtable({ apiKey }).base(baseID);

    // Create a new record in the Keywords table, including Difficulty if provided
    const fields = {
      Keyword: cleanKeyword
    };

    // Only include Difficulty if it's a valid number
    if (difficulty !== undefined && !isNaN(difficulty)) {
      fields.Difficulty = difficulty;
    }

    base('Keywords').create([
      {
        fields: fields
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



// Link keyword record to URL record
async function linkRecords(urlRecordId, keywordRecordId) {
  const base = new Airtable({ apiKey }).base(baseID);
  try {
    await base('URLs').update(urlRecordId, {
      'Primary Keyword': [keywordRecordId]
    });
    console.log(`Linked keyword record ${keywordRecordId} to URL record ${urlRecordId}`);
  } catch (error) {
    console.error(`Error linking keyword record ${keywordRecordId} to URL record ${urlRecordId}:`, error);
  }
}

module.exports = {
  fetchAllURLs,
  fetchAllKeywords,
  createKeywordRecord,
  linkRecords
};
