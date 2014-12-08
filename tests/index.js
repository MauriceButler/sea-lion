var test = require('tape'),
    SeaLion = require('../');

test('SeaLion is a function', function (t) {
    t.plan(1);
    t.equal(typeof SeaLion, 'function',  'SeaLion is a function');
});

test('new seaLion has default routes', function (t) {
    t.plan(2);

    var expectedRoutes = {
            '`404`': function(){},
            '`405`': function(){},
            '`500`': function(){}
        };

    var seaLion = new SeaLion();

    t.ok(seaLion._routes, 'routes exists');
    t.deepEqual(Object.keys(seaLion._routes), Object.keys(expectedRoutes), 'routes was set correctly');
});

test('new seaLion overides routes', function (t) {
    t.plan(4);

    var expectedRoutes = {
            '`404`': null,
            '`405`': function(){},
            '`500`': function(){},
            '/foo': function(){}
        };

    var seaLion = new SeaLion({
        '/foo': expectedRoutes['/foo']
    });

    t.deepEqual(Object.keys(seaLion._routes), Object.keys(expectedRoutes), 'got expected routes');
    t.equal(typeof seaLion._routes['`405`'], typeof expectedRoutes['`405`'], '405 route is correct');
    t.equal(typeof seaLion._routes['`500`'], typeof expectedRoutes['`500`'], '500 route is correct');
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
        defaultRoutes = {
            '`404`': null,
            '`405`': function(){},
            '`500`': function(){}
        }
        expectedRoutes = {
            '`404`': null,
            '`405`': function(){},
            '`500`': function(){},
            foo: 'bar',
            stuff: 'meh'
        },
        seaLion = new SeaLion();

    t.deepEqual(Object.keys(seaLion._routes), Object.keys(defaultRoutes),  'routes has correct keys to start');

    seaLion.add(testRoutes);

    t.deepEqual(Object.keys(seaLion._routes), Object.keys(expectedRoutes),  'routes has correct keys after add');
});

test.only('matched route gets handled', function (t) {
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

require('./matchRule');