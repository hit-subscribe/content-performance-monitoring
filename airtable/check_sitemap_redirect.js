/*
Run on the command line with the sitemap URL as the argument like:
node sitemap-parser.js https://makemeaprogrammer.com/sitemap_index.xml

*/

const Sitemapper = require('sitemapper');
const axios = require('axios');


// Hate doing this up here. Need to refactor someday.
const { Command } = require('commander');
const program = new Command();

// Define command line args
program
.name('sitemap-parser')
.description('Process a sitemap. Add URLS to Airtable.')
.version('0.3.0')
.option('-s, --map-url <url>', 'Sitemap URL')

// Parse them
program.parse();


if (typeof program.opts().mapUrl == 'undefined') {
  console.error('Please provide a sitemap URL as an argument.');
  process.exit(1);
}

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




async function checkRedirectURLs(urls) {

  for (let i = 0; i < urls.length; i++) {

    url = await axios.get(urls[i].url)
    .then(function (response) { 
        
        parsed_response = new URL(response.request.res.responseUrl)
        parsed_origin = new URL(urls[1].url)
    
    
        if (parsed_response.hostname.valueOf() != parsed_origin.hostname.valueOf()) {
            console.log(urls[1].url + " redirected to " + response.request.res.responseUrl)
        } 
      }

    ).catch((error) => console.log(error));
    if (i % 30 === 0) {
      console.log("i === " + i + " Sleeping.");
      let ms = 1000;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
    }
  }
}





const main = async () => {
  console.log('Checking sitemap for redirects.');
  try {

    console.log('Step 1: Fetching URLs from sitemap at ' + program.opts().mapUrl);
    const sitemapUrls = await getSitemapUrls(program.opts().mapUrl);
    await checkRedirectURLs(sitemapUrls);




    
  } catch (error) {
    console.error('An error occurred during processing:', error);
    process.exit(1);
  }
  console.log('Sitemap processing complete.');
};

main();
