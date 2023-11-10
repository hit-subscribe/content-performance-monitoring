const fs = require('fs');
var Client = require('node-rest-client').Client;
var SearchResult = require('./search-result');


function logForDebugging(data, response) {
	// parsed response body as js object
	console.log(data);
	
	// raw response
	//console.log(response);
}

//Abstract this shit out, get it under test, make it less stupid
function getApiKey(fileContents) {
	return fileContents.split("\n")[1].split(":")[1].replace(/(\r\n|\n|\r)/gm, "");;
}

function getCx(fileContents) {
	return fileContents.split("\n")[0].split(":")[1].replace(/(\r\n|\n|\r)/gm, "");;
}


var keyFileContents = fs.readFileSync('./keys.crd','utf8');
var cx = getCx(keyFileContents);
var key = getApiKey(keyFileContents);

var urlFileContents = fs.readFileSync('./newurls.txt','utf8');
var urls = urlFileContents.split("\r\n");

urls.forEach(function(url){

	var encodedUrl = encodeURIComponent(url);

	var client = new Client();
	var getUrl = `https://customsearch.googleapis.com/customsearch/v1?cx=${cx}&q=.&siteSearch=${encodedUrl}&key=${key}`;

	client.get(getUrl, function (data, response) {
		
		//logForDebugging(data, response);
		var searchResult = new SearchResult(data);
		var resultsCount = searchResult.resultsCount()
		//console.log("Result count is " + resultsCount);
		var result = url + ',' + resultsCount + '\n';
		console.log(result);

		fs.writeFile('./results.txt', result,  {'flag':'a'},  function(err) {
    	if (err) {
        	return console.error(err);
    	}
});
	});
})

