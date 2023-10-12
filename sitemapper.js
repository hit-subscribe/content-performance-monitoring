const Sitemapper = require('sitemapper');
const fs = require('fs');

class Page {
	constructor(url) {
		this.url = url;
	}

	async sendGetRequest() {
		try {
			console.log("Trying " + this.url);
			const response = await fetch(this.url);
			this.lastResponse = response.status;
			console.log("Finished, status " + this.lastResponse);
		}
		catch {
			console.log(error);
		}
	}

	serialize() {
		return this.url + ',' + this.lastResponse + '\n';
	}

}

(async () => {

	const sitemapper = new Sitemapper();
	var result = await sitemapper.fetch('https://www.relyance.ai/sitemap.xml'); 
	var pages = result.sites.map(site => { return new Page(site)});
	for(const page of pages) {
		await page.sendGetRequest();
	}
	
	var file = fs.createWriteStream('./livepages.csv');
	file.on('error', function(err) { });
	pages.forEach(p => file.write(p.serialize()));
	file.end();

}
)();

