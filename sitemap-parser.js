/*
Run on the command line with the sitemap url as the argument like:
node sitemap-parser.js https://makemeaprogrammer.com/sitemap_index.xml

You'll need to have an API key with the correct permissions for the table  in your .env file as:
AIRTABLE_API_KEY=YOURAPIKEY

And the ID of the base you want to use this in as

AIRTABLE_CURRENT_BASE=BASEID

get this from https://airtable.com/developers/web/api/introduction
*/


const Sitemapper = require('sitemapper');
const Airtable = require('airtable');
require('dotenv').config();
const URLfieldName = 'URL';
const URLtableName = 'URLs';
const baseID = process.env.AIRTABLE_CURRENT_BASE;
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(baseID);


async function getSitemapUrls(sitemapUrl) {
  try {

    const newSitemap = new Sitemapper();
    const sitemap = await newSitemap.fetch(sitemapUrl);

    /// outputs an array of URLs
    const urls = sitemap.sites;

    return urls;
  } catch (error) {
    console.error('Error fetching sitemap:', error);
  }
}


const getExistingUrls = async () => {
  const records = [];
  await base(URLtableName).select({
    fields: [URLfieldName], // Assuming your Airtable has a 'URL' field
    pageSize: 100
  }).eachPage((pageRecords, fetchNextPage) => {
    pageRecords.forEach((record) => {
      console.log(record.get('URL'));
      records.push(record.get('URL'));
    });
    fetchNextPage();
  });

  return records;
};

const addNewRecords = async (newUrls) => {
  const BATCH_SIZE = 10; // Airtable API allows max 10 records per request
  const recordsToAdd = newUrls.map((url) => ({
    fields: { [URLfieldName]: url }
  }));

  for (let i = 0; i < recordsToAdd.length; i += BATCH_SIZE) {
    const batch = recordsToAdd.slice(i, i + BATCH_SIZE); // Create a batch of 10

    try {
      await base(URLtableName).create(batch, { typecast: true });
      console.log(`Batch ${i / BATCH_SIZE + 1}: ${batch.length} records added to Airtable.`);
    } catch (error) {
      console.error(`Error adding batch ${i / BATCH_SIZE + 1}:`, error);
    }
  }
};

const main = async () => {
  const sitemapUrl = process.argv[2];
  if (!sitemapUrl) {
    console.error('Please provide a sitemap URL as an argument.');
    process.exit(1);
  }

  const sitemapUrls = await getSitemapUrls(sitemapUrl);

  // Get existing Airtable records
  const existingUrls = await getExistingUrls();

  // Filter out URLs already in Airtable
  const newUrls = sitemapUrls.filter(url => !existingUrls.includes(url));

  if (newUrls.length > 0) {
    await addNewRecords(newUrls);
  } else {
    console.log('No new URLs to add.');
  }
};

main();
