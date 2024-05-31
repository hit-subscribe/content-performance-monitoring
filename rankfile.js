class Entry {

    constructor(line) {
        var tokens = line.split(',').map(token => token.trim());
        this.url = tokens[0];
        this.keywords = tokens.slice(1);
    }

}

module.exports = class Rankfile {
    
    constructor(rankfileContents) {
        this.entryToCheck = rankfileContents.split('\n').map(line => new Entry(line));
    }

    getUrl(index) {
        return this.entryToCheck[index].url;
    }

    getKeyword(uIndex, kIndex) {
        return this.entryToCheck[uIndex].keywords[kIndex];
    }

}