module.exports = class Serp {

    constructor(result) {
        this.serpResults = result[0].result[0].items;
    }

    getRankOfUrl(url) {
        return parseInt(this.serpResults.find(entry  => entry.url === url).rank_absolute);
    }

}