var test = require('tape'),
    SeaLion = require('../');

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
    t.equal(seaLion._routes['/foo'], expectedRoutes['/foo'], '/foo route is correct');
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

test('matched route gets handled', function (t) {
    t.plan(1);

    var seaLion = new SeaLion({
        '/foo': function(request, response){
            t.pass();
        }
    });

    seaLion.handle({
        url:'/foo'
    });

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

    seaLion.handle({
        url:'/foo/new'
    });
});

test('matched route gets handled', function (t) {
    t.plan(1);

    var seaLion = new SeaLion({
        '/foo/`id`': function(request, response, tokens){
            t.equal(tokens.id, 'new');
        }
    });

    seaLion.handle({
        url:'/foo/new'
    });
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

    seaLion.handle({
        url:'/foo/a/b/c'
    });
});

require('./matchRule');
require('./matchRuleKeys');