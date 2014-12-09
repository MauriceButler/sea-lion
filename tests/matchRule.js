var test = require('tape'),
    matchRule = require('../matchRule');

test('parse simple route', function (t) {
    t.plan(1);
    t.deepEqual(matchRule('/foo'), ['/foo'],  'parsed route');
});

test('parse multiple rules', function (t) {
    t.plan(1);
    t.deepEqual(matchRule('/foo /bar'), ['/foo', '/bar'],  'parsed route');
});

test('parse single rule with ticks', function (t) {
    t.plan(1);
    t.deepEqual(matchRule('/`foo bar`'), ['/`foo bar`'],  'parsed route');
});

test('parse multiple rules with ticks', function (t) {
    t.plan(1);
    t.deepEqual(matchRule('/`foo` /`bar`'), ['/`foo`', '/`bar`'],  'parsed route');
});