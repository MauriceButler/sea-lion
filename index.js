var defaultRoutes = require('./defaultRoutes'),
    parseRoute = require('./parseRoute'),
    merge = require('flat-merge');

function addRoute(seaLion, route, handler){
    if(handler == null || typeof handler === 'object' && !~Object.keys(handler).length){
        throw "A route handler must be a function or an object with at least one key";
    }

    seaLion._routes[route] = handler;

    if(route in seaLion._rules){
        return;
    }

    seaLion._rules[route] = parseRoute(route);
}

function SeaLion(routes){
    this._rules = {};
    this._routes = {};

    this.add(merge(SeaLion.defaultRoutes));
    this.add(routes);
}
SeaLion.defaultRoutes = defaultRoutes;
SeaLion.prototype.add = function(routes){
    for(var key in routes){
        addRoute(this, key, routes[key]);
    }
};
SeaLion.prototype.match = function(url){
    var ruleKeys = Object.keys(this._rules),
        match;

    for(var i = 0; i < ruleKeys.length; i++){
        match = this._rules[ruleKeys[i]](url);

        if(match){
            return match;
        }
    } 
};
SeaLion.prototype.handle = function(request, response){
    var match = this.match(request.url),
        method = request.method;

    if(!match){
        return this._routes['`404`'](request, response);
    }

    console.log(match);

    var handler = this._routes[match.route];

    if(typeof handler !== 'function'){
        handler = handler[method] || handler.any || this._routes['`405`'];
    }

    handler(request, response);
};

module.exports = SeaLion;