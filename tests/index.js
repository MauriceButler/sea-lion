var test = require('tape'),
    Fraudster = require('fraudster'),
    fraudster = new Fraudster(),
    pathToObjectUnderTest = '../';

fraudster.registerAllowables([pathToObjectUnderTest]);

function resetMocks(){
    fraudster.registerMock('aquaduck', {});
    fraudster.registerMock('file-server', {});
    fraudster.registerMock('./routes', function(){});
}

function getCleanTestObject(){
    delete require.cache[require.resolve(pathToObjectUnderTest)];
    fraudster.enable({ useCleanCache: true, warnOnReplace: false });
    var objectUnderTest = require(pathToObjectUnderTest);
    fraudster.disable();
    resetMocks();
    return objectUnderTest;
}

resetMocks();

test('Ceeline is a function', function (t) {
    t.plan(1);
    var Ceeline = getCleanTestObject();
    t.equal(typeof Ceeline, 'function',  'Ceeline is a function');
});

test('new ceeline has default routes', function (t) {
    t.plan(6);

    var expectedRoutes = {
            '`404`': function(){},
            '`405`': function(){},
            '`500`': function(){}
        },
        testValue = 'foo';

    fraudster.registerMock('./routes', function(routes){
        t.deepEqual(Object.keys(routes), Object.keys(expectedRoutes), 'got expected routes');
        t.equal(typeof routes['`404`'], typeof expectedRoutes['`404`'], '404 route is correct');
        t.equal(typeof routes['`405`'], typeof expectedRoutes['`405`'], '405 route is correct');
        t.equal(typeof routes['`500`'], typeof expectedRoutes['`500`'], '500 route is correct');
        this.testValue = testValue;
    });

    var Ceeline = getCleanTestObject(),
        ceeline = new Ceeline();

    t.ok(ceeline.routes, 'routes exists');
    t.equal(ceeline.routes.testValue, testValue, 'routes was set correctly');
});

test('new ceeline overides routes', function (t) {
    t.plan(5);

    var expectedRoutes = {
            '`404`': null,
            '`405`': function(){},
            '`500`': function(){},
            'foo bar': 'stuff'
        },
        testValue = 'foo';

    fraudster.registerMock('./routes', function(routes){
        t.deepEqual(Object.keys(routes), Object.keys(expectedRoutes), 'got expected routes');
        t.notOk(routes['`404`'], '404 route was overridden');
        t.equal(typeof routes['`405`'], typeof expectedRoutes['`405`'], '405 route is correct');
        t.equal(typeof routes['`500`'], typeof expectedRoutes['`500`'], '500 route is correct');
        t.equal(routes['foo bar'], 'stuff', 'foo bar route is correct');
        this.testValue = testValue;
    });

    var Ceeline = getCleanTestObject();

    new Ceeline({
        '`404`': null,
        'foo bar': 'stuff'
    });
});

test('new ceeline has a router function', function (t) {
    t.plan(1);

    var Ceeline = getCleanTestObject(),
        ceeline = new Ceeline();

    t.equal(typeof ceeline.router, 'function', 'router is a function');
});

require('./routes');