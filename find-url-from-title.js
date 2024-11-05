const fs = require('fs');
const csv = require('csv-parser');
const Fuse = require('fuse.js');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Define field names as variables
const URL_FIELD = 'URLs';
const TITLE_FIELD = 'Title';
const KEYWORDS_FIELD = 'Keywords'; // Define a constant for keywords

// Configure the CSV writer for output
const csvWriter = createCsvWriter({
  path: 'csv/keyword-match-netbox.csv',  // Updated output path
  header: [
    { id: URL_FIELD, title: URL_FIELD },
    { id: 'score', title: 'Score' },
    { id: TITLE_FIELD, title: TITLE_FIELD },
    { id: KEYWORDS_FIELD, title: KEYWORDS_FIELD } // Add keywords field to header
  ]
});

// Function to load data from a CSV file
function loadData(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
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

(async () => {
  const urlsFile = 'csv/get-titles-netbox.csv';
  const titlesFile = 'csv/netbox-eldorado.csv';

  try {
    // Load raw data from CSVs
    const urls = await loadData(urlsFile);
    const rawTitles = await loadData(titlesFile);

    const titles = rawTitles.map(row => {
      const sanitizedRow = sanitizeKeys(row);  // Use sanitized keys
      return {
        [TITLE_FIELD]: sanitizedRow[TITLE_FIELD].trim(),
        [KEYWORDS_FIELD]: sanitizedRow[KEYWORDS_FIELD], // Include keywords in the mapping
        ...sanitizedRow
      };
    });

    // Configure Fuse.js for fuzzy searching titles
    const fuse = new Fuse(urls, { keys: ['Title'], threshold: 0.1, includeScore: true });

    const resultsToWrite = [];

    for (let i = 0; i < titles.length; i++) {
      const searchTerm = titles[i].Title;
      const results = fuse.search(searchTerm);

      if (results[0]) {
        const thing = {
          [TITLE_FIELD]: titles[i].Title,
          [KEYWORDS_FIELD]: titles[i][KEYWORDS_FIELD], // Include keywords in the output
          'score': results[0].score,
          [URL_FIELD]: results[0].item.URL
        };

        resultsToWrite.push(thing); // Add matched entry to resultsToWrite
      }
    }
    console.log(resultsToWrite);
    // Write results to csv/keyword-match.csv
    await csvWriter.writeRecords(resultsToWrite);
    console.log('Output written to csv/keyword-match-netbox.csv');
  } catch (error) {
    console.error('Error:', error);
  }
})();
