/*
Run on the command line with the sitemap URL as the argument like:
node sitemap-parser.js https://makemeaprogrammer.com/sitemap_index.xml

Ensure you have your Airtable API key and base ID in your .env file as:
AIRTABLE_API_KEY=YOURAPIKEY
AIRTABLE_CURRENT_BASE=BASEID
*/

const Sitemapper = require('sitemapper');
const Airtable = require('airtable');
require('dotenv').config();

const URLfieldName = 'URLs';
const URLtableName = 'URLs';
const LastmodFieldName = 'LastMod';


// Hate doing this up here. Need to refactor someday.
const { Command } = require('commander');
const program = new Command();

// Define command line args
program
.name('sitemap-parser')
.description('Process a sitemap. Add URLS to Airtable.')
.version('0.5.0')
.option('-a, --api-key <key>', 'Airtable API Key')
.option('-b, --base-id <id>', 'Airtable Base ID')
.option('-s, --map-url <url>', 'Sitemap URL')
.option('-r, --replace \"<find replace>\"', 'Search and replace. One space between text to find and text to replace it with.');

// Parse them
program.parse();

// Command line beats env file
baseId = "not defined";
apiKey = "not defined";
if (typeof program.opts().apiKey !== 'undefined') {
  apiKey = program.opts().apiKey;
  console.log("Using api key from command line.");
} else {
  apiKey = process.env.AIRTABLE_API_KEY;
}

if (typeof program.opts().baseId !== 'undefined') {
  console.log("Using base id from command line.");
  baseId = program.opts().baseId;
} else {
  baseId = process.env.AIRTABLE_CURRENT_BASE;
}


if (typeof program.opts().mapUrl == 'undefined') {
  console.error('Please provide a sitemap URL as an argument.');
  process.exit(1);
}

const base = new Airtable({ apiKey: apiKey }).base(baseId);

async function getSitemapUrls(sitemapUrl) {
  console.log(`Fetching sitemap URLs from: ${sitemapUrl}`);
  try {
    const newSitemap = new Sitemapper(
      {
        url: sitemapUrl,
        fields: {
          lastmod: true,
          loc: true
        }
      }
    );
    const sitemap = await newSitemap.fetch();
  console.log(sitemap)
    // Outputs an array of URLs with lastmod data
    const urls = sitemap.sites.map(site => ({
      url: site.loc,
      lastmod: site.lastmod || null,
    }));
    console.log(`Fetched ${urls.length} URLs from sitemap.`);
    return urls;
  } catch (error) {
    console.error('Error fetching sitemap:', error);
    throw error;  // Re-throw error to be handled in main
  }
}

const getExistingUrls = async () => {
  console.log('Fetching existing URLs from Airtable...');
  const records = [];
  return new Promise((resolve, reject) => {
    base(URLtableName).select({
      pageSize: 100
    }).eachPage(
      (pageRecords, fetchNextPage) => {
        pageRecords.forEach((record) => {
          records.push(record.get(URLtableName));
        });
        fetchNextPage();
      },
      (err) => {
        if (err) {
          console.error('Error fetching existing URLs from Airtable:', err);
          reject(err);
        } else {
          console.log(`Fetched ${records.length} existing URLs from Airtable.`);
          resolve(records);
        }
      }
    );
  });
};

const addNewRecords = async (newUrls) => {
  console.log(`Adding ${newUrls.length} new URLs to Airtable...`);
  const BATCH_SIZE = 10;
  const recordsToAdd = newUrls.map(({ url, lastmod }) => ({
    fields: {
      [URLfieldName]: url,
      [LastmodFieldName]: lastmod
    }
  }));

  for (let i = 0; i < recordsToAdd.length; i += BATCH_SIZE) {
    const batch = recordsToAdd.slice(i, i + BATCH_SIZE);
    try {
      await base(URLtableName).create(batch, { typecast: true });
      console.log(`Batch ${i / BATCH_SIZE + 1}: Added ${batch.length} records to Airtable.`);
    } catch (error) {
      console.error(`Error adding batch ${i / BATCH_SIZE + 1}:`, error);
    }
  }
  console.log('Finished adding new URLs to Airtable.');
};


function searchReplaceURLs(urls, replace) {

  splitted = replace.trim().split(" ");

  if (splitted.length != 2) {
    throw new Error("\n\nGarbled search and replace arguments. Please be sure to only use one space.\n\n");
  }

  for (let i = 0; i < urls.length; i++) {
    newUrl = urls[i].url.replace(splitted[0], splitted[1]);
    urls[i].url = newUrl;
  }
}


const main = async () => {
  console.log('Starting sitemap processing...');
  try {

    console.log('Step 1: Fetching URLs from sitemap at ' + program.opts().mapUrl);
    const sitemapUrls = await getSitemapUrls(program.opts().mapUrl);
    if (typeof program.opts().replace !== 'undefined') {
      searchReplaceURLs(sitemapUrls, program.opts().replace);
    }

    console.log('Step 2: Fetching existing URLs from Airtable...');
    const existingUrls = await getExistingUrls();
    console.log('Step 3: Filtering new URLs...');
    const newUrls = sitemapUrls.filter(({ url }) => !existingUrls.includes(url));
    console.log(`Found ${newUrls.length} new URLs to add.`);

    if (newUrls.length > 0) {
      console.log('Step 4: Adding new URLs to Airtable...');
      await addNewRecords(newUrls);
    } else {
      console.log('No new URLs to add.');
    }
  } catch (error) {
    console.error('An error occurred during processing:', error);
    process.exit(1);
  }
  console.log('Sitemap processing complete.');
};

main();
