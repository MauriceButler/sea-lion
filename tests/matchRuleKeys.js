var test = require('tape'),
    getRuleKeys = require('../getRuleKeys');

test('parse simple route', function (t) {
    t.plan(1);
    t.deepEqual(getRuleKeys('/foo'), [],  'matched no keys');
});

test('parse multiple rules', function (t) {
    t.plan(1);
    t.deepEqual(getRuleKeys('/foo /bar'), [],  'matched no keys');
});

test('parse single rule with ticks', function (t) {
    t.plan(1);
    t.deepEqual(getRuleKeys('/`foo bar`'), ['foo bar'],  'matched correct key');
});

test('parse multiple rules with ticks', function (t) {
    t.plan(1);
    t.deepEqual(getRuleKeys('/`foo` /`bar`'), ['foo', 'bar'],  'matched correct keys');
});