# Base Setup Steps

Update .env with base ID

Add the sitemap to the base `node airtable/sitemap-parser.js sitemap-url.xml

Get titles of posts
node tools/get-title.js csv/input-urls.csv csv/output-titles.csv

Match titles found to titles in our database
node tools/find-url-from-title.js csv/output-titles.csv csv/input-titles.csv csv/output-match.csv

Upload keywords for urls
node airtable/keyword-matcher.js csv/output-match.csv

Upload KD from Ahrefs Export

Fill in DA in formula in Keywords table
Generate and import rankchecker.

## Matching URLs to keywords

1. Get the titles of all posts, input is a csv of all urls `node tools/get-title.js csv/site-urls.csv csv/site-titles.csv`
2. Match the titles from the site with the titles from our system `node tools/find-url-from-title site-titles.csv our-data.csv output.csv`
