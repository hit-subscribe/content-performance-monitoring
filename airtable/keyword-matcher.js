const fs = require('fs');
const csv = require('csv-parser');
const { fetchAllURLs, createKeywordRecord, linkRecords } = require('./airtableModule');

// Configuration: Map the CSV column names to variable names
const CSV_COLUMNS = {
  url: 'Current URL',          // Column name for URLs
  keywords: 'Keyword',         // Column name for Keywords
  difficulty: 'KD'             // Column name for Difficulty (if exists)
};

// Get CSV file path from command-line arguments
const csvPath = "csv/matched-keywords-unusual.csv"
//const csvPath = process.argv[2];
if (!csvPath) {
  console.error("Please provide a CSV file path as a command-line argument.");
  process.exit(1); // Exit the script if no file path is provided
}

console.log(`CSV file path: ${csvPath}`);  // Log the path for debugging

async function loadCSVAndCheckAirtable(csvPath, airtableView = "Grid view") {
  const csvData = [];

  // Step 1: Read the CSV file and store its contents in an array
  fs.createReadStream("csv/matched-keywords-unusual.csv")
    .pipe(csv())
    .on('data', (row) => {
      csvData.push(row);
    })
    .on('end', async () => {
      console.log('CSV file successfully processed');
      try {
        // Step 2: Fetch all Airtable records
        const airtableRecords = await fetchAllURLs(airtableView);

        for (const csvRecord of csvData) {
          // Ensure you're referencing the right column names based on the CSV_COLUMNS mapping
          const matchingRecord = airtableRecords.find(airtableRecord => airtableRecord.URLs === csvRecord[CSV_COLUMNS.url]);

          if (matchingRecord) {
            console.log(`Match found for CSV URL ${csvRecord[CSV_COLUMNS.url]}`);
            const keywords = csvRecord[CSV_COLUMNS.keywords].split(',').map(k => k.trim());

            for (const keyword of keywords) {
              try {
                // Ensure that Difficulty exists before passing it
                const difficulty = csvRecord[CSV_COLUMNS.difficulty] ? csvRecord[CSV_COLUMNS.difficulty] : null;
                const keywordObj = { Keyword: keyword, Difficulty: difficulty };

                // Create the keyword record
                const createdRecord = await createKeywordRecord(keywordObj);
                console.log(`Keyword record created: ${createdRecord.fields.Keyword}`);

                // Link the newly created keyword to the URL record
                await linkRecords(matchingRecord.id, createdRecord.id);
              } catch (error) {
                console.error(`Error creating or linking keyword record for ${keyword}:`, error);
              }
            }
          } else {
            console.log(`No match found for CSV URL ${csvRecord[CSV_COLUMNS.url]}`);
          }
        }
      } catch (error) {
        console.error('Error processing records:', error);
      }
    });
}

// Call the function with the Airtable view name
loadCSVAndCheckAirtable();
