const Sitemapper = require('sitemapper');
const fs = require('fs');

(async () => {

	var sitemap = process.argv[2];

	const sitemapper = new Sitemapper();
	var result = await sitemapper.fetch(sitemap); 
	
	var file = fs.createWriteStream('./livepages.csv');
	for(const site of result.sites) {
		console.log(site);
		file.write(site + '\n');
	}

}
)();

