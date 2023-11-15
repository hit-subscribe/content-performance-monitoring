const fs = require('fs');
var Client = require('node-rest-client').Client;
var SearchResult = require('./search-result');

const CredentialsStore = require('./custom-search-credentials');


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

var urlFileContents = fs.readFileSync('./newurls.txt','utf8');
var urls = urlFileContents.split("\r\n");

urls.forEach(function(url){

	var encodedUrl = encodeURIComponent(url);

	var client = new Client();
	var getUrl = `https://customsearch.googleapis.com/customsearch/v1?cx=${cx}&q=.&siteSearch=${encodedUrl}&key=${key}`;

	console.log(getUrl);

	client.get(getUrl, function (data, response) {
		
		//logForDebugging(data, response);
		var searchResult = new SearchResult(data);
		var resultsCount = searchResult.resultsCount()
		var result = url + ',' + resultsCount + '\n';

		console.log(result);

		fs.writeFile('./results.txt', result,  {'flag':'a'},  function(err) {
    	if (err) {
        	return console.error(err);
    	}
});
	});
})

