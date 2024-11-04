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
const baseID = process.env.AIRTABLE_CURRENT_BASE;
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(baseID);



async function getSitemapUrls(sitemapUrl) {
  console.log(`Fetching sitemap URLs from: ${sitemapUrl}`);
  try {
    const newSitemap = new Sitemapper(
      {
        url: sitemapUrl,
        fields: { lastmod: true,
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


getSitemapUrls('https://www.sentinelone.com/sitemap_index.xml');
