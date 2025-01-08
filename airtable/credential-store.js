module.exports = class CredentialsStore {

	constructor(fileContentsAsString) {

		if(!fileContentsAsString) {
			throw new Error('Invalid credentials file.');
		}
		this.dictionary = this.getDictionary(fileContentsAsString.split('\n'));
	}

	getCredential(key) {		
		return this.dictionary[key];
	}

	getDictionary(array) {
		const dictionary = {};
	  
		array.forEach(item => {
		  const [key, value] = item.split(':').map(part => part.trim());
		  dictionary[key] = value;
		});
	  
		return dictionary;
	  }

}