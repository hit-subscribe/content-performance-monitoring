module.exports = class CustomSearchCredentials {

	constructor(fileContentsAsString) {

		if(!fileContentsAsString) {
			throw new Error('Invalid credentials file.');
		}
		this.fileContents = fileContentsAsString;
	}

	getApiKey() {
		return this.fileContents.split("\n")[1].split(":")[1].replace(/(\r\n|\n|\r)/gm, "");;
	}

	getCx() {
		return this.fileContents.split("\n")[0].split(":")[1].replace(/(\r\n|\n|\r)/gm, "");;
	}

}