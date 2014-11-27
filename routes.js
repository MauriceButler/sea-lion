function Routes(routes){
    this.add(routes);
}

Routes.prototype.add = function(routes){
    for(var key in routes){
        this[key] = routes[key];
    }
};

module.exports = Routes;