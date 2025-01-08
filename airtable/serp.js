module.exports = class Serp {

    constructor(result) {
        this.serpResults = result[0].result[0].items;
    }

    getRankOfUrl(url) {
        return parseInt(this.serpResults.find(entry  => entry.url === url).rank_absolute);
    }

    getFirstOccurrenceOfSite(url) {
        return parseInt(this.serpResults.find(entry  => entry.domain.includes(url)).rank_absolute);
    }

    getEntryNumber(rank) {
        return this.serpResults.find(entry => entry.rank_absolute == rank);
    }

    getUrls() {
        return this.serpResults.map(sr => sr.url);
    }

}