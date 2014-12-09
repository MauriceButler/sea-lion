var parseRoute = require('./parseRoute'),
    url = require('url');

function addRoute(seaLion, route, handler){
    if(handler == null || typeof handler === 'object' && !~Object.keys(handler).length){
        throw 'A route handler must be a function or an object with at least one key';
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

    this.add(routes);
}
SeaLion.prototype.add = function(routes){
    for(var key in routes){
        addRoute(this, key, routes[key]);
    }
};
SeaLion.prototype.match = function(pathname){
    var ruleKeys = Object.keys(this._rules),
        match;

    for(var i = 0; i < ruleKeys.length; i++){
        match = this._rules[ruleKeys[i]](pathname);

        if(match){
            return match;
        }
    }
};
SeaLion.prototype.createHandler = function(){
    var seaLion = this;
    return function(request, response){
        var pathname = url.parse(request.url).pathname,
            match = seaLion.match(pathname),
            method = request.method.toLowerCase();

        if(!match){
            return seaLion.notFound(request, response);
        }

        var handler = seaLion._routes[match.route];

        if(typeof handler !== 'function'){
            handler = handler[method] || handler[method.toUpperCase()] || handler.any || seaLion.methodNotAllowed;
        }

        try{
            handler(request, response, match.tokens);
        }catch(error){
            seaLion.error(request, response, error);
        }
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
SeaLion.prototype.error = function(request, response, error) {
    if(!error){
        error = 'Internal Server Error. The server encountered an unexpected condition which prevented it from fulfilling the request.';
    }

    console.error('Error accessing: ' + request.method + ' ' + request.url, error.stack || error.message || error);

    var body = 
        'An exception was thrown while accessing: ' + request.method + ' ' + request.url + '\n' +
        'Exception: ' + (error.message || error);

    response.writeHead(500, { 'Content-Length': body.length, 'Content-Type': 'text/plain' });
    response.end(body);
};

module.exports = SeaLion;