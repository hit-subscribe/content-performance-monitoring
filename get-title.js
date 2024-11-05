const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Set up CSV writer for output file
const csvWriter = createCsvWriter({
  path: 'csv/get-titles.csv',
  header: [
    { id: 'url', title: 'URL' },
    { id: 'title', title: 'Title' }
  ]
});

// Function to fetch the title from a URL
async function getTitle(url) {
  console.log(url)
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const title = $('title').text();
    return title || 'No title found';
  } catch (error) {
    console.error(`Error fetching ${url}:`, error.message);
    return 'Error fetching title';
  }
}

// Function to load data from a CSV file
function loadData(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        // console.log('Read results:', results);
        resolve(results);
      })
      .on('error', reject);
  });
}

// Helper function to sanitize row keys
function sanitizeKeys(row) {
  const sanitizedRow = {};
  Object.keys(row).forEach(key => {
    const cleanKey = key.trim().replace(/^\uFEFF/, ''); // Remove BOM and trim whitespace
    sanitizedRow[cleanKey] = row[key];
  });
  return sanitizedRow;
}

// Function to process URLs from CSV file, fetch titles, and save to another CSV
function processUrlsFromCsv() {
  const records = [];
  fs.createReadStream('csv/URLs-scratchpad.csv')
    .pipe(csv())
    .on('data', (row) => {
      console.log(row)
      const sanitizedRow = sanitizeKeys(row);
      const url = sanitizedRow.URLs; // Assuming the column name is "URL"
      records.push({ url });
    })
    .on('end', async () => {
      for (const record of records) {
        record.title = await getTitle(record.url);
        console.log(`Fetched title for ${record.url}: ${record.title}`);
      }

      // Write records with titles to the output CSV
      csvWriter.writeRecords(records)
        .then(() => {
          console.log('Titles saved to csv/get-titles.csv');
        })
        .catch(error => {
          console.error('Error writing to CSV:', error.message);
        });
    })
    .on('error', (error) => {
      console.error('Error reading URLs from CSV:', error.message);
    });
}

// Run the function
processUrlsFromCsv();
