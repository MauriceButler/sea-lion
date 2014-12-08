var matchKey = /`((?:\\`|[^`])*)`/g;

module.exports = function(rule){
    var matches = [],
        match;

    while ((match = matchKey.exec(rule)) && matches.push(match[1])){} // YOLO

    return matches;
};