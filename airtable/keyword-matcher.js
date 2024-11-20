const fs = require('fs');
const csv = require('csv-parser');
const { fetchAllRecords, createRecord, linkRecords } = require('./airtableModule');

// Configuration: Map the CSV column names to variable names
const CSV_COLUMNS = {
  url: 'URL',          // Column name for URLs
  keywords: 'Keyword(s)',         // Column name for Keywords
  difficulty: 'KD'             // Column name for Difficulty (if exists)
};

const csvPath = process.argv[2];
if (!csvPath) {
  console.error("Please provide a CSV file path as a command-line argument.");
  console.log('Command-line arguments:', process.argv);
  process.exit(1);
}
console.log(`CSV file path: ${csvPath}`);  // Log the path for debugging

// Adjusted configuration for Airtable
const AIRTABLE_TABLE_NAME_URLS = "URLs"; // Adjust to match your Airtable table for URLs
const AIRTABLE_TABLE_NAME_KEYWORDS = "Keywords"; // Adjust to match your Airtable table for Keywords
const AIRTABLE_LINK_FIELD_NAME = "Primary Keyword"; // Adjust to match your linking field name in the URLs table

async function loadCSVAndCheckAirtable() {
  const csvData = [];
  const airtableFields = ["URLs"]; // Specify fields to fetch
  fs.createReadStream(csvPath)
    .pipe(csv())
    .on("data", (row) => {
      csvData.push(row);
    })
    .on("end", async () => {
      console.log("CSV file successfully processed");
      try {
        // Fetch Airtable records
        const airtableRecords = await fetchAllRecords(AIRTABLE_TABLE_NAME_URLS, airtableFields);

        for (const csvRecord of csvData) {
          const matchingRecord = airtableRecords.find(
            (airtableRecord) => airtableRecord.URLs === csvRecord[CSV_COLUMNS.url]
          );

          if (matchingRecord) {
            console.log(`Match found for CSV URL ${csvRecord[CSV_COLUMNS.url]}`);
            const keywords = csvRecord[CSV_COLUMNS.keywords].split(",").map(k => k.trim());

            for (const keyword of keywords) {
              try {
                const difficulty = csvRecord[CSV_COLUMNS.difficulty] || null;
                const keywordObj = { Keyword: keyword, Difficulty: difficulty };

                // Create the keyword record
                const createdRecord = await createRecord(AIRTABLE_TABLE_NAME_KEYWORDS, keywordObj);
                console.log(`Keyword record created: ${createdRecord.fields.Keyword}`);

                // Link the newly created keyword to the URL record
                await linkRecords(
                  AIRTABLE_TABLE_NAME_URLS,
                  matchingRecord.id,
                  AIRTABLE_LINK_FIELD_NAME,
                  [createdRecord.id]
                );
              } catch (error) {
                console.error(`Error creating or linking keyword record for ${keyword}:`, error);
              }
            }
          } else {
            console.log(`No match found for CSV URL ${csvRecord[CSV_COLUMNS.url]}`);
          }
        }
      } catch (error) {
        console.error("Error processing records:", error);
      }
    });
}

loadCSVAndCheckAirtable();
