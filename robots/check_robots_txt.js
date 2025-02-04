import robotsParser from 'robots-txt-parser';



console.log("Hi");

const robots = robotsParser(
    {
        userAgent: 'Googlebot', // The default user agent to use when looking for allow/disallow rules, if this agent isn't listed in the active robots.txt, we use *.
        allowOnNeutral: false, // The value to use when the robots.txt rule's for allow and disallow are balanced on whether a link can be crawled.
    },
);


robots.fetch('https://www.sainsburys.co.uk/')
    .then((tree) => {
        console.log(Object.keys(tree)); // Will log sitemap and any user agents.
    });

/*   
robots.useRobotsFor('http://hitsubscribe.com')
.then(() => {
    console.log("Got robots.txt");
    robots.canCrawlSync('https://www.hitsubscribe.com/our-results/'); // Returns true if the link can be crawled, false if not.
    robots.canCrawl('https://www.hitsubscribe.com/our-results/', (value) => {
    console.log('Crawlable: ', value);
    }); // Calls the callback with true if the link is crawlable, false if not.
    robots.canCrawl('https://www.hitsubscribe.com/our-results/') // If no callback is provided, returns a promise which resolves with true if the link is crawlable, false if not.
    .then((value) => {
        console.log('Crawlable: ', value);
    });
});
*/
