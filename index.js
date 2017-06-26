var parseRoute = require('./parseRoute'),
    url = require('url');

function addRoute(seaLion, route, handler){
    if(handler == null || typeof handler === 'object' && !~Object.keys(handler).length){
        throw 'A route handler must be a function or an object with at least one key';
    }

    if(typeof handler === 'function'){
        handler = {
            any: handler
        };
    }

    if(!seaLion._routes[route]){
        seaLion._routes[route] = {};
    }

    for(var key in handler){
        seaLion._routes[route][key] = handler[key];
    }

    if(route in seaLion._rules){
        return;
    }

    seaLion._rules[route] = parseRoute(route);
}

function getValidMethod(handler, method){
    return handler[method.toLowerCase()] || handler[method.toUpperCase()] || handler.any;
}

function SeaLion(routes){
    this._rules = {};
    this._routes = {};

    this.add(routes);
}
SeaLion.prototype.add = function(routes){
    for(var key in routes){
        addRoute(this, key, routes[key]);
    }
};
SeaLion.prototype.match = function(pathname, method){
    var seaLion = this,
        ruleKeys = Object.keys(this._rules),
        matches = [];

    for(var i = 0; i < ruleKeys.length; i++){
        var match = this._rules[ruleKeys[i]](pathname);

        if(match){
            matches.push(match);
        }
    }

    var sorted = matches.sort(function(a,b) {
            return Object.keys(a.tokens).length - Object.keys(b.tokens).length;
        });

    while(sorted.length){
        var possibleMatch = sorted.shift(),
            possibleHandler = seaLion._routes[possibleMatch.route];

        if(typeof possibleHandler === 'function' || getValidMethod(possibleHandler, method)){
            return possibleMatch;
        }
    }

};
SeaLion.prototype.createHandler = function(){
    var seaLion = this;
    return function(request, response){
        var pathname = url.parse(request.url).pathname,
            match = seaLion.match(pathname, request.method);

        if(!match){
            return seaLion.notFound(request, response);
        }

        var handler = seaLion._routes[match.route];

        if(typeof handler !== 'function'){
            handler = getValidMethod(handler, request.method) || seaLion.methodNotAllowed;
        }

        handler(request, response, match.tokens);
    };
};
SeaLion.prototype.notFound = function(request, response) {
    var body = '404: The server has not found anything matching the Request-URI.';
    response.writeHead(404, { 'Content-Length': body.length, 'Content-Type': 'text/plain' });
    response.end(body);

    console.log('404: ' + request.url);
};
SeaLion.prototype.methodNotAllowed = function(request, response) {
    var body = '405: The method specified in the Request-Line is not allowed for the resource identified by the Request-URI.';
    response.writeHead(405, { 'Content-Length': body.length, 'Content-Type': 'text/plain' });
    response.end(body);

    console.log('405: url: ' + request.url + ' verb: ' + request.method);
};

module.exports = SeaLion;
