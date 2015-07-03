var matchRule = require('./matchRule'),
    getRuleKeys = require('./getRuleKeys'),
    sanitiseRegex = /[#\-\[\]^$*?+{}|]|\.(?!(?:\.)|`)/g;

function sanitise(rule){
    return rule.replace(sanitiseRegex, '\\$&');
}

function createRuleRegex(rule){
    return new RegExp(
        '^' +
        sanitise(rule)
        .replace(/`(?:\\`|[^`])*?\.\.\.`/g, '(.*?)')
        .replace(/`(?:\\`|[^`])*?`/g, '([^/]*?)') +
        '$');
}

function matchUrl(pathname, ruleDefinition){
    var match = pathname.match(ruleDefinition.regex);

    if(!match){
        return;
    }

    var tokens = {};

    for(var i = 0; i < ruleDefinition.keys.length; i++){
        tokens[ruleDefinition.keys[i].replace(/\.\.\.$/, '')] = match[i+1];
    }

    return {
        route: ruleDefinition.route,
        rule: ruleDefinition.rule,
        regex: ruleDefinition.regex,
        tokens: tokens
    };
}

function createRouteMatcher(ruleDefinitions){
    return function(pathname){
        for(var i = 0; i < ruleDefinitions.length; i++){
            var match = matchUrl(pathname, ruleDefinitions[i]);

            if(match){
                return match;
            }
        }
    };
}

module.exports = function(route){
    var rules = matchRule(route),
        ruleDefinitions = [];

    if(route == null || !rules){
        throw 'Could not parse route: ' + route;
    }

    for(var i = 0; i < rules.length; i++){
        ruleDefinitions[i] = {
            route: route,
            rule: rules[i],
            keys: getRuleKeys(rules[i]),
            regex: createRuleRegex(rules[i])
        };
    }

    return createRouteMatcher(ruleDefinitions);
};