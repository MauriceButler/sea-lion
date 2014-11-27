var aquaduck = require('aquaduck'),
    fileServer = require('file-server'),
    Routes = require('./routes');

function CeeLine(customRoutes){
    var defaultRoutes = {
        '`404`': function(){},
        '`405`': function(){},
        '`500`': function(){}
    };

    if(customRoutes){
        for(var key in customRoutes){
            defaultRoutes[key] = customRoutes[key];
        }
    }

    this.routes = new Routes(defaultRoutes);
}

CeeLine.prototype.router = function(request, response){

};

module.exports = CeeLine;

