const fs = require('fs');
const Client = require('node-rest-client').Client;
const SearchResult = require('./search-result');
const CredentialsStore = require('./credential-store');
const { get } = require('http');

function logForDebugging(data, response) {
	// parsed response body as js object
	console.log(data);	
	// raw response
	//console.log(response);
}

var keyFileContents = fs.readFileSync('./keys.crd','utf8');
var credentialStore = new CredentialsStore(keyFileContents);
var cx = credentialStore.getCredential('customSearchCx');
var key = credentialStore.getCredential('customSearchKey');

 
var rankFileContents = fs.readFileSync('./rankfile.txt','utf8').split(',');
var keyword = encodeURIComponent(rankFileContents[0]);
var url = rankFileContents[1];

var siteSearch = rankFileContents[2] == 0 ? '' : `&siteSearch=${encodeURIComponent(rankFileContents[3])}`;

var client = new Client();
var getUrl = `https://customsearch.googleapis.com/customsearch/v1?cx=${cx}&q=${keyword}${siteSearch}&key=${key}`;

console.log(getUrl);

getResults();

function getResults() {

    client.get(getUrl, function (data, response) {
            
        logForDebugging(data, response);
        var searchResult = new SearchResult(data);

        console.log('Rank is ' + searchResult.getFirstResultFor(url));
    });
}
