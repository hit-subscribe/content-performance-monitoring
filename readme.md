# Base Setup Steps

1. Update .env with base ID
2. Add the sitemap to the base `node airtable/sitemap-parser.js sitemap-url.xml
3. Fill in DA in formula in Keywords table
4. Generate and import rankchecker.

## Matching URLs to keywords

1. Get the titles of all posts, input is a csv of all urls `node tools/get-title.js csv/site-urls.csv csv/site-titles.csv`
2. Match the titles from the site with the titles from our system `node tools/find-url-from-title site-titles.csv our-data.csv output.csv`
