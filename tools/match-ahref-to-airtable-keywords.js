const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const unusualKeywordsFile = 'csv/unusual-keywords.csv';
const vcKeywordsFile = 'csv/vc-keywords-to-match.csv';
const outputCsvFile = 'csv/matched-keywords-unusual.csv';

// Function to sanitize keys in each row
function sanitizeKeys(row) {
  const sanitizedRow = {};
  Object.keys(row).forEach(key => {
    const cleanKey = key.trim().replace(/^\uFEFF/, ''); // Remove BOM and trim whitespace
    sanitizedRow[cleanKey] = row[key];
  });
  return sanitizedRow;
}

// Read unusual keywords and store in a map
const unusualKeywordsMap = new Map();

fs.createReadStream(unusualKeywordsFile)
  .pipe(csv())
  .on('data', (row) => {
    const sanitizedRow = sanitizeKeys(row); // Sanitize the row keys
    if (sanitizedRow.Keyword && sanitizedRow['Current URL'] && sanitizedRow.KD) {
      unusualKeywordsMap.set(sanitizedRow.Keyword.toLowerCase(), {
        CurrentURL: sanitizedRow['Current URL'],
        KD: sanitizedRow.KD
      });
    } else {
      console.warn("Skipped a row due to missing fields in unusual-keywords.csv:", sanitizedRow);
    }
  })
  .on('end', () => {
    console.log('Unusual keywords loaded successfully.');

    // Process VC keywords and find matches
    const matches = [];

    fs.createReadStream(vcKeywordsFile)
      .pipe(csv())
      .on('data', (row) => {
        const sanitizedRow = sanitizeKeys(row); // Sanitize the row keys
        if (sanitizedRow.Keyword) {
          const keyword = sanitizedRow.Keyword.toLowerCase();
          if (unusualKeywordsMap.has(keyword)) {
            const match = unusualKeywordsMap.get(keyword);
            matches.push({
              Keyword: sanitizedRow.Keyword,
              CurrentURL: match.CurrentURL,
              KD: match.KD
            });
          }
        } else {
          console.warn("Skipped a row due to missing Keyword in vc-keywords-to-match.csv:", sanitizedRow);
        }
      })
      .on('end', () => {
        console.log('VC keywords processed.');

        const csvWriter = createCsvWriter({
          path: outputCsvFile,
          header: [
            { id: 'Keyword', title: 'Keyword' },
            { id: 'CurrentURL', title: 'Current URL' },
            { id: 'KD', title: 'KD' }
          ]
        });

        csvWriter.writeRecords(matches)
          .then(() => {
            console.log('Matched keywords written to csv/matched-keywords-unusual.csv');
          })
          .catch(error => console.error('Error writing CSV file:', error));
      });
  });
