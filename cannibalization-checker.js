const fs = require('fs');
const axios = require('axios');
const CredentialsStore = require('./credential-store');
const Serp = require('./serp');

var keyFileContents = fs.readFileSync('./keys.crd','utf8');
var credentialStore = new CredentialsStore(keyFileContents);

var dataForSeoUsername = credentialStore.getCredential('dataForSeoUsername');
var dataforSeoPassword = credentialStore.getCredential('dataForSeoPassword');

var clientSite = process.argv[2];
var keyword = process.argv.slice(3).join(' ');

checkForCannibalizing();

function checkForCannibalizing() {

    const rankCheckRequest = constructRankCheckRequest(keyword);
    getRank(rankCheckRequest, clientSite).then((rank) => {
        console.log(`Rank for ${clientSite}, ${keyword} is ${rank}`);
    });

    const siteSearchRequest = constructSiteSearchRequest(clientSite, keyword);
    getFirstResultOfSiteSearch(siteSearchRequest).then((result) => {
        console.log(`Top rank match on site is ${result.url} with title ${result.title}`);
    });

}


function getRank(postRequest, clientSite) {
    return new Promise((resolve, reject) => {
        axios(postRequest).then(function (response) {
            var result = response['data']['tasks'];
            var serp = new Serp(result);
            resolve(serp.getFirstOccurrenceOfSite(clientSite));
        }).catch(function (error) {
            console.log(error);
        });
    })
}

function getFirstResultOfSiteSearch(postRequest) {
    return new Promise((resolve, reject) => {
        axios(postRequest).then(function (response) {
            var result = response['data']['tasks'];
            var serp = new Serp(result);
            resolve(serp.getEntryNumber(1));
        }).catch(function (error) {
            console.log(error);
        });
    })
}

function constructSiteSearchRequest(clientSite, keyword) {
    return {
        method: 'post',
        url: 'https://api.dataforseo.com/v3/serp/google/organic/live/regular',
        auth: {
            username: dataForSeoUsername,
            password: dataforSeoPassword
        },
        data: [{
            "keyword": `site:${clientSite} ${encodeURIComponent(keyword)}`,
            "language_code": "en",
            "location_code": 2840
        }],
        headers: {
            'content-type': 'application/json'
        }
    };
}

function constructRankCheckRequest(keyword) {
    return {
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
}

