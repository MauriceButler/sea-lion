var test = require('tape'),
    pathToObjectUnderTest = '../routes';

test('Routes is a function', function (t) {
    t.plan(1);
    var Routes = require(pathToObjectUnderTest);
    t.equal(typeof Routes, 'function',  'Routes is a function');
});

test('Routes added keys from routes', function (t) {
    t.plan(1);
    var Routes = require(pathToObjectUnderTest),
        testRoutes = {
            foo: 'bar',
            stuff: 'meh'
        },
        routes = new Routes(testRoutes);

    t.deepEqual(Object.keys(routes), Object.keys(testRoutes),  'routes has correct keys');
});

test('Routes adds keys using routes.add', function (t) {
    t.plan(2);
    var Routes = require(pathToObjectUnderTest),
        testRoutes = {
            foo: 'bar',
            stuff: 'meh'
        },
        routes = new Routes();

    t.deepEqual(Object.keys(routes), [],  'routes has correct keys to start');

    routes.add(testRoutes);

    t.deepEqual(Object.keys(routes), Object.keys(testRoutes),  'routes has correct keys after add');
});