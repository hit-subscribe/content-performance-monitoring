const fs = require('fs');
const csv = require('csv-parser');
const Fuse = require('fuse.js');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Define field names as variables
const URL_FIELD = 'URLs';
const TITLE_FIELD = 'Title';

// Configure the CSV writer for output
const csvWriter = createCsvWriter({
  path: 'output.csv',
  header: [
    { id: URL_FIELD, title: URL_FIELD },
    { id: 'score', title: 'score' },
    { id: TITLE_FIELD, title: TITLE_FIELD }
  ]
});

// Load URLs and process their last segments
function loadURLs(filePath) {
  return new Promise((resolve, reject) => {
    const urls = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Log all keys for debugging
        console.log('Row Keys:', Object.keys(row));
        // Check for URL_FIELD with trimming
        if (row[URL_FIELD.trim()]) {
          const urlParts = row[URL_FIELD.trim()].split('/');
          const lastPart = urlParts[urlParts.length - 1];
          const keywords = lastPart.replace(/-/g, ' ').replace(/\W+/g, ' ').trim();
          urls.push({ url: row[URL_FIELD.trim()], keywords });
        } else {
          console.error(`Missing URL field for row: ${JSON.stringify(row)}`);
        }
      })
      .on('end', () => resolve(urls))
      .on('error', reject);
  });
}

// Load titles from post-names.csv for Fuse.js search
function loadTitles(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(titles))
      .on('error', reject);

  });

}

(async () => {
  const urlsFile = 'csv/URLs-scratchpad.csv';
  const titlesFile = 'csv/post-names.csv';

  try {
    // Load and process data from CSVs
    //const urls = await loadURLs(urlsFile);
    const titles = await loadTitles(titlesFile);

    // Configure Fuse.js for fuzzy searching titles
  //  const fuse = new Fuse(titles, { keys: [TITLE_FIELD], threshold: 0.4 });

    const resultsToWrite = [];

    // Perform search for each extracted URL keyword set
  /*  urls.forEach(({ url, keywords }) => {
      const results = fuse.search(keywords);
      results.forEach((result) => {
        resultsToWrite.push({
          [URL_FIELD]: url,
          score: result.score,
          [TITLE_FIELD]: result.item[TITLE_FIELD]
        });
      });
    });*/

    // Write results to output.csv
   // await csvWriter.writeRecords(resultsToWrite);
    console.log('Output written to output.csv');
  } catch (error) {
    console.error('Error:', error);
  }
})();
