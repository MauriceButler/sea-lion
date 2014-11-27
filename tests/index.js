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

test('SeaLion is a function', function (t) {
    t.plan(1);
    var SeaLion = getCleanTestObject();
    t.equal(typeof SeaLion, 'function',  'SeaLion is a function');
});

test('new seaLion has default routes', function (t) {
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

    var SeaLion = getCleanTestObject(),
        seaLion = new SeaLion();

    t.ok(seaLion.routes, 'routes exists');
    t.equal(seaLion.routes.testValue, testValue, 'routes was set correctly');
});

test('new seaLion overides routes', function (t) {
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

    var SeaLion = getCleanTestObject();

    new SeaLion({
        '`404`': null,
        'foo bar': 'stuff'
    });
});

test('new seaLion has a router function', function (t) {
    t.plan(1);

    var SeaLion = getCleanTestObject(),
        seaLion = new SeaLion();

    t.equal(typeof seaLion.router, 'function', 'router is a function');
});

require('./routes');