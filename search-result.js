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
}