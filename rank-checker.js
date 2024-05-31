const fs = require('fs');
const axios = require('axios');
const Rankfile = require('./rankfile');
const CredentialsStore = require('./credential-store');
const Serp = require('./serp');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

var keyFileContents = fs.readFileSync('./keys.crd','utf8');
var credentialStore = new CredentialsStore(keyFileContents);

var dataForSeoUsername = credentialStore.getCredential('dataForSeoUsername');
var dataforSeoPassword = credentialStore.getCredential('dataForSeoPassword');

var rankfile = new Rankfile(fs.readFileSync('./rankfile.txt','utf8'));

const csvWriter = createCsvWriter({
    path: 'rank_results.csv',
    header: [
        {id: 'url', title: 'URL'},
        {id: 'keyword', title: 'Keyword'},
        {id: 'rank', title: 'Rank'}
    ]
});

function getRankSafely(serp, url) {
    try {
        return serp.getRankOfUrl(url);
    } catch (error) {
        return 100; // Set rank to 100 if an exception is thrown
    }
}


let results = [];

getDataForSeoResults();

function getDataForSeoResults() {
    let requests = [];

    rankfile.entryToCheck.forEach((entry, entryIndex) => {
        entry.keywords.forEach((keyword, keywordIndex) => {

            const postRequest = {
                method: 'post',
                url: 'https://api.dataforseo.com/v3/serp/google/organic/live/regular',
                auth: {
                    username: dataForSeoUsername,
                    password: dataforSeoPassword
                },
                data: [{
                    "keyword": encodeURIComponent(keyword),
                    "language_code": "en",
                    "location_code": 2840
                }],
                headers: {
                    'content-type': 'application/json'
                }
            };

            let request = axios(postRequest).then(function (response) {
                
                var result = response['data']['tasks'];
                var serp = new Serp(result);
                var rank = getRankSafely(serp,entry.url);
                
                results.push({url: entry.url, keyword: keyword, rank: rank, entryIndex, keywordIndex});
                //console.log(`Rank for ${entry.url}, ${keyword} is ${rank}`);

            }).catch(function (error) {
                console.log(error);
            });

            requests.push(request);
        })
    })

    Promise.all(requests).then(() => {

        results.sort((a, b) => a.entryIndex === b.entryIndex ? a.keywordIndex - b.keywordIndex : a.entryIndex - b.entryIndex);
        // Remove index fields before writing to CSV
        const csvResults = results.map(({ entryIndex, keywordIndex, ...rest }) => rest);

        csvWriter.writeRecords(csvResults)
            .then(() => {
                console.log('CSV file was written successfully');
            })
            .catch((err) => {
                console.log('Error writing CSV file', err);
            });
    });
}
