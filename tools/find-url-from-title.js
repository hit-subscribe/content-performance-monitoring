//node script.js urls.csv titles.csv output.csv


const fs = require('fs');
const csv = require('csv-parser');
const Fuse = require('fuse.js');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Define field names as variables
const URL_FIELD = 'URL';
const TITLE_FIELD = 'Title';
const KEYWORDS_FIELD = 'Keywords';

// Get file paths from command-line arguments
const urlsFile = process.argv[2];
const titlesFile = process.argv[3];
const outputFilePath = process.argv[4];

if (!urlsFile || !titlesFile || !outputFilePath) {
  console.error('Please provide paths for the URLs file, titles file, and output file.');
  console.error('Usage: node script.js <urls.csv> <titles.csv> <output.csv>');
  process.exit(1);
}

// Configure the CSV writer for output
const csvWriter = createCsvWriter({
  path: outputFilePath,
  header: [
    { id: URL_FIELD, title: URL_FIELD },
    { id: 'score', title: 'Score' },
    { id: TITLE_FIELD, title: TITLE_FIELD },
    { id: KEYWORDS_FIELD, title: KEYWORDS_FIELD }
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
  try {
    // Load raw data from CSVs
    const urls = await loadData(urlsFile);
    const rawTitles = await loadData(titlesFile);

    const titles = rawTitles.map(row => {
      const sanitizedRow = sanitizeKeys(row);
      return {
        [TITLE_FIELD]: sanitizedRow[TITLE_FIELD].trim(),
        [KEYWORDS_FIELD]: sanitizedRow[KEYWORDS_FIELD],
        ...sanitizedRow
      };
    });

    // Configure Fuse.js for fuzzy searching titles
    const fuse = new Fuse(urls, { keys: [TITLE_FIELD], threshold: 0.3, includeScore: true });

    const resultsToWrite = [];

    for (let i = 0; i < titles.length; i++) {
      const searchTerm = titles[i][TITLE_FIELD];
      const results = fuse.search(searchTerm);

      if (results[0]) {
        const thing = {
          [TITLE_FIELD]: titles[i][TITLE_FIELD],
          [KEYWORDS_FIELD]: titles[i][KEYWORDS_FIELD],
          'score': results[0].score,
          [URL_FIELD]: results[0].item[URL_FIELD]
        };

        resultsToWrite.push(thing);
      }
    }
    console.log(resultsToWrite);

    // Write results to the specified output CSV
    await csvWriter.writeRecords(resultsToWrite);
    console.log(`Output written to ${outputFilePath}`);
  } catch (error) {
    console.error('Error:', error);
  }
})();
