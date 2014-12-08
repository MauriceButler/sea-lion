module.exports = function(route){
    return route.match(/((?:[^\s`]+|(?:`(?:\\`|[^`])*`))+)/g);
};