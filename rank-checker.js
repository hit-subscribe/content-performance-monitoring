const fs = require('fs');
const axios = require('axios');
const Rankfile = require('./rankfile');
const CredentialsStore = require('./credential-store');
const Serp = require('./serp');

var keyFileContents = fs.readFileSync('./keys.crd','utf8');
var credentialStore = new CredentialsStore(keyFileContents);

var dataForSeoUsername = credentialStore.getCredential('dataForSeoUsername');
var dataforSeoPassword = credentialStore.getCredential('dataForSeoPassword');

var rankfile = new Rankfile(fs.readFileSync('./rankfile.txt','utf8'));


getDataForSeoResults();

function getDataForSeoResults() {

    rankfile.rankings.forEach((ranking) => {
        ranking.keywords.forEach((keyword) => {

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

            axios(postRequest).then(function (response) {
                
                var result = response['data']['tasks'];
                var serp = new Serp(result);
                var rank = serp.getRankOfUrl(ranking.url);
                
                console.log(`Rank for ${ranking.url}, ${keyword} is ${rank}`);

            }).catch(function (error) {
                console.log(error);
            });
        })
    })
}
