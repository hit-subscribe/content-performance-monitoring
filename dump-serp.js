const fs = require('fs');
const axios = require('axios');
const CredentialsStore = require('./credential-store');
const Serp = require('./serp');

var keyFileContents = fs.readFileSync('./keys.crd','utf8');
var credentialStore = new CredentialsStore(keyFileContents);

var dataForSeoUsername = credentialStore.getCredential('dataForSeoUsername');
var dataforSeoPassword = credentialStore.getCredential('dataForSeoPassword');

var searchString = process.argv.slice(2).join(' ');

dumpSerp();

function dumpSerp() {
    const serpRequest = constructSerpRequest(searchString);
    getEntries(serpRequest).then((urls) => {
        urls.forEach(url => {console.log(url)});
    });
}

function getEntries(postRequest) {
    return new Promise((resolve, reject) => {
        axios(postRequest).then(function (response) {
            var result = response['data']['tasks'];
            var serp = new Serp(result);
            resolve(serp.getUrls());
        }).catch(function (error) {
            console.log(error);
        });
    })
}

function constructSerpRequest(keyword) {
    return {
        method: 'post',
        url: 'https://api.dataforseo.com/v3/serp/google/organic/live/regular',
        auth: {
            username: dataForSeoUsername,
            password: dataforSeoPassword
        },
        data: [{
            "keyword": `${encodeURIComponent(keyword)}`,
            "language_code": "en",
            "location_code": 2840
        }],
        headers: {
            'content-type': 'application/json'
        }
    };
}