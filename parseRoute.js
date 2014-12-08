var matchRule = require('./matchRule'),
    sanitiseRegex = /[#-.\[\]-^?]/g;

function sanitise(rule){
    return rule.replace(sanitiseRegex, '\\$&');
}

function createRuleRegex(rule){
    return new RegExp('^' + sanitise(rule).replace(/`.*?`/g, '(.*?)') + '$');
}

function matchUrl(url, ruleDefinition){
    var match = url.match(ruleDefinition.regex);

    if(!match){
        return;
    }

    var tokens = {};

    for(var i = 1; i < match.length; i++){
        tokens[names[i].slice(1,-1)] = match[i];
    }

    return {
        route: route,
        rule: ruleDefinition.rule,
        regex: ruleDefinition.regex,
        tokens: tokens
    };
}

function createRouteMatcher(ruleDefinitions){
    return function(url){
        for(var i = 0; i < ruleDefinitions.length; i++){
            var match = matchUrl(url, ruleDefinitions[i]);

            if(match){
                return match;
            }
        }
    };
};

module.exports = function(route){
    var rules = matchRule(route),
        ruleDefinitions = [];

    if(route == null || !rules){
        throw "Could not parse route: " + route;
    }

    for(var i = 0; i < rules.length; i++){
        ruleDefinitions[i] = {
            rule: rules[i],
            regex: createRuleRegex(rules[i])
        };
    }

    return createRouteMatcher(ruleDefinitions);
};