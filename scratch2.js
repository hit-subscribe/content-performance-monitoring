const fs = require('fs');
const csv = require('csv-parser');
const { fetchAllURLs, createKeywordRecord } = require('./airtableModule');

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

      // Step 2: Fetch all Airtable records
      try {
        const airtableRecords = await fetchAllURLs(airtableView);

        // Step 3: For each CSV record, check if there is a matching record in Airtable
        for (const csvRecord of csvData) {
          const matchingRecord = airtableRecords.find(airtableRecord => airtableRecord.URLs === csvRecord.URLs);

          if (matchingRecord) {
            console.log(`Match found for CSV URL ${csvRecord.URLs}`);

            // Step 4: Split the Keywords field and create a record for each keyword
            const keywords = csvRecord.Keywords.split(',').map(k => k.trim());
            for (const keyword of keywords) {
              try {
                const createdRecord = await createKeywordRecord(keyword);
                console.log(`Keyword record created: ${createdRecord.fields.Keyword}`);
              } catch (error) {
                console.error(`Error creating keyword record for ${keyword}:`, error);
              }
            }
          } else {
            console.log(`No match found for CSV URL ${csvRecord.URLs}`);
          }
        }
      } catch (error) {
        console.error('Error fetching records from Airtable:', error);
      }
    });
}

// Call the function with the path to your CSV file and Airtable view name
loadCSVAndCheckAirtable('csv/keyword-match.csv');
