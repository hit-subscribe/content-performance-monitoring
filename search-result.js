module.exports = class SearchResult {

	constructor(responseData) {
		this.responseData = responseData;
	}
	
	resultsCount() {
		if(typeof this.responseData.searchInformation === "undefined") {
			throw new Error('Response error.');
		}
		return this.responseData.searchInformation.totalResults;
	}

	getFirstResultFor(baseUrl) {
		return this.responseData.items.findIndex(result => result.link.toString().includes(baseUrl)) + 1;
	}
}