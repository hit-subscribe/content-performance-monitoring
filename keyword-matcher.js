const fs = require('fs');
const csv = require('csv-parser');
const { fetchAllURLs, fetchAllKeywords, createKeywordRecord } = require('./airtableModule');
const Airtable = require('airtable');

const baseID = process.env.AIRTABLE_CURRENT_BASE;
const apiKey = process.env.AIRTABLE_API_KEY;
const base = new Airtable({ apiKey }).base(baseID);

async function loadCSVAndCheckAirtable(csvPath, airtableView = "Grid view") {
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
        // Step 2: Fetch all Airtable records from the URLs table
        const airtableRecords = await fetchAllURLs(airtableView);

        // Step 3: Fetch all existing keywords from the Keywords table
        const existingKeywords = await fetchAllKeywords("Grid view");
        const existingKeywordSet = new Set(existingKeywords.map(record => record.Keyword.toLowerCase()));

        // Step 4: For each CSV record, check if there is a matching record in Airtable
        for (const csvRecord of csvData) {
          const matchingRecord = airtableRecords.find(airtableRecord => airtableRecord.URLs === csvRecord.URLs);

          if (matchingRecord) {
            console.log(`Match found for CSV URL ${csvRecord.URLs}`);

            // Step 5: Split the Keywords field and check each keyword
            const keywords = csvRecord.Keywords.split(',').map(k => k.trim().toLowerCase());
            for (const keyword of keywords) {
              let keywordRecordId;

              if (!existingKeywordSet.has(keyword)) {
                try {
                  const createdRecord = await createKeywordRecord(keyword);
                  console.log(`Keyword record created: ${createdRecord.fields.Keyword}`);
                  existingKeywordSet.add(keyword); // Add to the set to avoid duplicate creations in this session
                  keywordRecordId = createdRecord.id; // Store the new keyword record ID
                } catch (error) {
                  console.error(`Error creating keyword record for ${keyword}:`, error);
                  continue; // Skip this keyword if there was an error
                }
              } else {
                console.log(`Keyword "${keyword}" already exists, skipping creation.`);
                const existingKeywordRecord = existingKeywords.find(record => record.Keyword.toLowerCase() === keyword);
                keywordRecordId = existingKeywordRecord.id; // Use the existing keyword record ID
              }

              // Step 6: Link the URL record to the keyword record in the "Primary Keyword" field
              if (keywordRecordId) {
                await base('URLs').update(matchingRecord.id, {
                  'Primary Keyword': [keywordRecordId]
                }).then((updatedRecord) => {
                  console.log(`Linked keyword ${keyword} to URL record ${matchingRecord.id}`);
                }).catch((error) => {
                  console.error(`Error linking keyword ${keyword} to URL record:`, error);
                });
              }
            }
          } else {
            console.log(`No match found for CSV URL ${csvRecord.URLs}`);
          }
        }
      } catch (error) {
        console.error('Error processing records:', error);
      }
    });
}

// Call the function with the path to your CSV file and Airtable view name
loadCSVAndCheckAirtable('csv/keyword-match.csv');
