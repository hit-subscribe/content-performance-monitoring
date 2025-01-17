import fs from 'fs';
import axios from 'axios';

import CredentialsStore from 'credential-store';

var keyFileContents = fs.readFileSync('./keys.crd','utf8');
var credentialStore = new CredentialsStore(keyFileContents);

var dataForSeoUsername = credentialStore.getCredential('dataForSeoUsername');
var dataforSeoPassword = credentialStore.getCredential('dataForSeoPassword');

export default class Serp {

    constructor(result) {
        this.serpResults = result[0].result[0].items;
    }

    getRankOfUrl(url) {
        return parseInt(this.serpResults.find(entry  => entry.url === url).rank_absolute);
    }

    getFirstOccurrenceOfSite(url) {
        return parseInt(this.serpResults.find(entry  => entry.domain.includes(url)).rank_absolute);
    }

    getEntryNumber(rank) {
        return this.serpResults.find(entry => entry.rank_absolute == rank);
    }

    getUrls() {
        return this.serpResults.map(sr => sr.url);
    }

    // Check how many entries in this serp?
    static getSERPForKeyword(keyword) {
    
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
    
        let serp = axios(postRequest).then(function (response) {
    
            var result = response['data']['tasks'];
            return new Serp(result);
            
        }).catch(function (error) {
            console.log(error);
        });

        return serp;
    }
}