function getH1Title(htmlAsText) {
    let h1StartingLocation = htmlAsText.indexOf("<h1");
    let h1TagEndLocation = htmlAsText.substring(h1StartingLocation).indexOf(">") + h1StartingLocation;
    let h1CloseLocation = htmlAsText.substring(h1TagEndLocation).indexOf("</h1") + h1TagEndLocation;

    return htmlAsText.substring(h1TagEndLocation + 1, h1CloseLocation);
}

function getTags(url) {
    let tokens = url.split("/");
    const firstPathToken = 3;

    return tokens.slice(firstPathToken, tokens.length - 1);
}

function getSlugTitle(url) {
    let tokens = url.split("/").filter(e => e);
    return tokens.length > 3 ? tokens[tokens.length - 1] : '';
}

module.exports = {
 getH1Title,
 getTags,
 getSlugTitle
}