class Ranking {

    constructor(line) {
        var tokens = line.split(',');
        this.url = tokens[0];
        this.keywords = tokens.slice(1);
    }

}

module.exports = class Rankfile {
    
    constructor(rankfileContents) {
        this.rankings = rankfileContents.split('\n').map(line => new Ranking(line));
    }

    getUrl(index) {
        return this.rankings[index].url;
    }

    getKeyword(uIndex, kIndex) {
        return this.rankings[uIndex].keywords[kIndex];
    }

}