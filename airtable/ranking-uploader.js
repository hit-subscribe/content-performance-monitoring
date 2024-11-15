const fs = require('fs');
const csv = require('csv-parser');
const { fetchAllRecords, createRecord, linkRecords } = require('./airtableModule');

// Get CSV file path from command-line arguments
const csvPath = process.argv[2];
if (!csvPath) {
  console.error("Please provide a CSV file path as a command-line argument.");
  process.exit(1); // Exit the script if no file path is provided
}

console.log(`CSV file path: ${csvPath}`); // Log the path for debugging

async function loadCSVAndCreateRankingResults(csvPath) {
  const csvData = [];

  // Step 1: Read the CSV file and store its contents in an array
  fs.createReadStream(csvPath)
    .pipe(csv())
    .on('data', (row) => {
      csvData.push(row);
    })
    .on('end', async () => {
      console.log('CSV file successfully processed');
      try {
        // Fetch all Airtable records for URLs and Keywords
        const airtableURLs = await fetchAllRecords('URLs', ['URLs']);
        const airtableKeywords = await fetchAllRecords('Keywords', ['Keyword']);

        // Step 2: Process each CSV record
        for (const csvRecord of csvData) {
          const url = csvRecord['URL'];
          const keyword = csvRecord['Keyword'];
          const rank = parseInt(csvRecord['Rank'], 10); // Ensure rank is an integer

          // Search for matching URL and Keyword in the fetched arrays
          const matchingURLRecord = airtableURLs.find(record => record.URLs === url);
          const matchingKeywordRecord = airtableKeywords.find(record => record.Keyword === keyword);

          if (matchingURLRecord && matchingKeywordRecord) {
            // Create a new Ranking Result record without Keywords and URLs
            const rankingResult = await createRecord('Ranking Results', {
              Number: rank
            });
            console.log(`Ranking result created for URL: ${url}, Keyword: ${keyword}, Rank: ${rank}`);

            // Link the ranking result to the URL and Keyword records
            await linkRecords('URLs', matchingURLRecord.id, 'Ranking Results', [rankingResult.id]);
            await linkRecords('Keywords', matchingKeywordRecord.id, 'Ranking Results', [rankingResult.id]);
          } else {
            console.log(`No match found for URL: ${url} or Keyword: ${keyword}`);
          }
        }
      } catch (error) {
        console.error('Error processing records:', error);
      }
    });
}

// Run the function
loadCSVAndCreateRankingResults(csvPath);
