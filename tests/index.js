var test = require('tape'),
    SeaLion = require('../');

function fakeRequest(url, method){
    return {
        url: url,
        method: method || 'GET'
    };
}

test('SeaLion is a function', function (t) {
    t.plan(1);
    t.equal(typeof SeaLion, 'function',  'SeaLion is a function');
});

test('new seaLion takes routes', function (t) {
    t.plan(2);

    var expectedRoutes = {
            '/foo': function(){}
        };

    var seaLion = new SeaLion({
        '/foo': expectedRoutes['/foo']
    });

    t.deepEqual(Object.keys(seaLion._routes), Object.keys(expectedRoutes), 'got expected routes');
    t.deepEqual(seaLion._routes['/foo'], {any: expectedRoutes['/foo']}, '/foo route is correct');
});

test('can only add valid routes', function (t) {
    t.plan(1);

    var seaLion = new SeaLion();

    t.throws(function(){
        seaLion.add({
            '/foo': null
        });
    });
});

test('add routes using seaLion.add', function (t) {
    t.plan(2);
    var testRoutes = {
            foo: 'bar',
            stuff: 'meh'
        },
        expectedRoutes = {
            foo: 'bar',
            stuff: 'meh'
        },
        seaLion = new SeaLion();

    t.deepEqual(Object.keys(seaLion._routes), [],  'routes has no keys to start');

    seaLion.add(testRoutes);

    t.deepEqual(Object.keys(seaLion._routes), Object.keys(expectedRoutes),  'routes has correct keys after add');
});

test('add routes handels multiple calls correctly', function (t) {
    t.plan(2);
    var testRoutes = {
            foo: {
                GET: 'foo'
            }
        },
        testRoutes2 = {
            stuff: {
                GET: 'meh'
            }
        },
        testRoutes3 = {
            stuff: {
                POST: 'things'
            }
        },
        expectedRoutes = {
            foo: {
                GET: 'foo'
            },
            stuff: {
                GET: 'meh',
                POST: 'things'
            }
        },
        seaLion = new SeaLion();

    t.deepEqual(Object.keys(seaLion._routes), [],  'routes has no keys to start');

    seaLion.add(testRoutes);
    seaLion.add(testRoutes2);
    seaLion.add(testRoutes3);

    t.deepEqual(seaLion._routes, expectedRoutes,  'routes has correct keys after multiple adds and overrides');
});

test('matched route gets handled', function (t) {
    t.plan(1);

    var seaLion = new SeaLion({
        '/foo': function(request, response){
            t.pass();
        }
    });

    seaLion.createHandler()(fakeRequest('/foo'));

});

test('matched route gets handled', function (t) {
    t.plan(1);

    var seaLion = new SeaLion({
        '/foo/new': function(request, response){
            t.pass();
        },
        '/foo/`id`': function(request, response){
            t.fail();
        }
    });

    seaLion.createHandler()(fakeRequest('/foo/new'));
});

test('matched route gets handled', function (t) {
    t.plan(1);

    var seaLion = new SeaLion({
        '/foo/`id`': function(request, response, tokens){
            t.equal(tokens.id, 'new');
        }
    });

    seaLion.createHandler()(fakeRequest('/foo/new'));
});

test('matched route gets tokens wrong order', function (t) {
    t.plan(1);

    var seaLion = new SeaLion({
        '/foo/`id`': function(request, response){
            t.fail();
        },
        '/foo/new': function(request, response){
            t.pass();
        }
    });

    seaLion.createHandler()(fakeRequest('/foo/new'));
});

test('matched route gets tokens wrong order with tokens', function (t) {
    t.plan(1);

    var seaLion = new SeaLion({
        '/foo/`id`/`bar`': function(request, response){
            t.fail();
        },
        '/foo/`id`/potato': function(request, response){
            t.pass();
        }
    });

    seaLion.createHandler()(fakeRequest('/foo/new/potato'));
});

test('matched route gets correct method when identical routes in wrong order', function (t) {
    t.plan(1);

    var seaLion = new SeaLion({
        '/foo/`things`': {
            PUT: function(request, response){
                t.fail();
            }
        },
        '/foo/`stuff`': {
            GET: function(request, response){
                t.pass();
            }
        },
        '/foo/`pototoes`': {
            POST: function(request, response){
                t.fail();
            }
        }
    });

    seaLion.createHandler()(fakeRequest('/foo/majigger'));
});

test('matched route same token length precedence order', function (t) {
    t.plan(1);

    var seaLion = new SeaLion({
        '/`things...`.foo': {
            GET: function(request, response){
                t.pass();
            }
        },
        '/`things...`': {
            GET: function(request, response){
                t.fail();
            }
        }
    });

    seaLion.createHandler()(fakeRequest('/majigger.foo'));
});

test('matched route gets handled', function (t) {
    t.plan(3);

    var seaLion = new SeaLion({
        '/foo/`1`/`2`/`3`': function(request, response, tokens){
            t.equal(tokens[1], 'a');
            t.equal(tokens[2], 'b');
            t.equal(tokens[3], 'c');
        }
    });

    seaLion.createHandler()(fakeRequest('/foo/a/b/c'));
});

test('multi-rule route is matched', function (t) {
    t.plan(3);

    var seaLion = new SeaLion({
        '/foo /bar': function(request, response){
            t.pass();
        }
    });
    seaLion.notFound = function(request){
        t.equal(request.url, '/baz');
    };

    seaLion.createHandler()(fakeRequest('/foo'));
    seaLion.createHandler()(fakeRequest('/bar'));
    seaLion.createHandler()(fakeRequest('/baz'));
});

test('multi-rule route with tokens is matched', function (t) {
    t.plan(3);

    var seaLion = new SeaLion({
        '/foo/`bar` /bar': function(request, response, tokens){
            if(Object.keys(tokens).length){
                t.equal(request.url, '/foo/bar');
                t.equal(tokens.bar, 'bar');
            }else{
                t.equal(request.url, '/bar');
            }
        }
    });

    seaLion.createHandler()(fakeRequest('/foo/bar'));
    seaLion.createHandler()(fakeRequest('/bar'));
});

test('matching stops on slashes', function (t) {
    t.plan(1);

    var seaLion = new SeaLion({
        '/foo/`id`': function(request, response, tokens){
            t.fail();
        },
        '/foo/`id`/bar': function(request, response, tokens){
            t.pass();
        }
    });

    seaLion.createHandler()(fakeRequest('/foo/bar/bar'));
});

test('get rest of path', function (t) {
    t.plan(2);

    var seaLion = new SeaLion({
        '/foo/`thing...`': function(request, response, tokens){
            t.pass();
        }
    });
    seaLion.notFound = function(request){
        t.fail();
    };

    seaLion.createHandler()(fakeRequest('/foo/thing/bar.svg'));
    seaLion.createHandler()(fakeRequest('/foo/thing/bar.png'));
});

test('get lots of path', function (t) {
    t.plan(2);

    var seaLion = new SeaLion({
        '/foo/`thing...`.svg': function(request, response, tokens){
            t.equal(tokens.thing, 'thing/bar', 'Matches .svg');
        }
    });
    seaLion.notFound = function(request){
        t.pass('route didn\'t match .png');
    };

    seaLion.createHandler()(fakeRequest('/foo/thing/bar.svg'));
    seaLion.createHandler()(fakeRequest('/foo/thing/bar.png'));
});

test('get multiple tokens from path', function (t) {
    t.plan(2);

    var seaLion = new SeaLion({
        '/`foo`/`thing`': function(request, response, tokens){
            t.equal(tokens.foo, 'baz', 'Matches baz');
            t.equal(tokens.thing, 'thing', 'Matches thing');
        }
    });

    seaLion.createHandler()(fakeRequest('/baz/thing'));
});

test('get multiple types of token from path', function (t) {
    t.plan(2);

    var seaLion = new SeaLion({
        '/`foo`/`thing...`': function(request, response, tokens){
            t.equal(tokens.foo, 'baz', 'Matches baz');
            t.equal(tokens.thing, 'thing/bar.svg', 'Matches rest of path');
        }
    });

    seaLion.createHandler()(fakeRequest('/baz/thing/bar.svg'));
});

test('method routing', function (t) {
    t.plan(1);

    var seaLion = new SeaLion({
        '/foo': {
            get: function(request, response, tokens){
                t.fail();
            },
            post: function(request, response, tokens){
                t.pass();
            }
        }
    });

    seaLion.createHandler()(fakeRequest('/foo', 'POST'));
});

test('any method routing', function (t) {
    t.plan(1);

    var seaLion = new SeaLion({
        '/foo': {
            post: function(request, response, tokens){
                t.fail();
            },
            any: function(request, response, tokens){
                t.pass();
            }
        }
    });

    seaLion.createHandler()(fakeRequest('/foo'));
});

test('any method routing to fn', function (t) {
    t.plan(1);

    var seaLion = new SeaLion({
        '/foo': function(request, response, tokens){
            t.pass();
        }
    });

    seaLion.createHandler()(fakeRequest('/foo', 'POST'));
});

test('query strings', function (t) {
    t.plan(1);

    var seaLion = new SeaLion({
        '/foo': function(request, response, tokens){
            t.pass();
        }
    });

    seaLion.createHandler()(fakeRequest('/foo?bar=baz'));
});

test('query strings with rest token', function (t) {
    t.plan(1);

    var seaLion = new SeaLion({
        '/`foo...`': function(request, response, tokens){
            t.pass();
        }
    });

    seaLion.createHandler()(fakeRequest('/bar?bar=baz'));
});

require('./matchRule');
require('./matchRuleKeys');