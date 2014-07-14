var test = require('grape'),
    createClient = require('./clientMock'),
    patternSubscriber = require('../')();

test('redis-pattern-subscriber exists', function(t) {
    t.plan(2);
    t.ok(patternSubscriber, 'redis-pattern-subscriber exists');
    t.equal(typeof patternSubscriber, 'function', 'redis-pattern-subscriber is a function');
});

test('gets correct message', function(t) {
    t.plan(2);
    var client = createClient(),
        testPattern = 'test',
        testPattern2 = 'test 2',
        testMessage = 'the message',
        testCallback = function(error, message) {
            t.equal(message, testMessage, 'got correct message');
        t.notOk(error, 'should not error');

        };

    patternSubscriber(client, testPattern, testCallback);
    client.mockPublish(testPattern, null, testMessage);
    client.mockPublish(testPattern2, null, testMessage);
});

test('unsubscribes correctly', function(t) {
    t.plan(4);
    var client = createClient(),
        testPattern = 'test',
        testMessage = 'the message',
        expectedMessage = 'Unsubscribed from ' + testPattern,
        testCallback = function(error, message) {
            t.equal(message, testMessage, 'got correct message');
        };

    var unsubscribe = patternSubscriber(client, testPattern, testCallback);
    client.mockPublish(testPattern, null, testMessage);
    unsubscribe(function(error, message){
        t.pass('Unsubscribed');
        t.notOk(error, 'should not error');
        t.equal(message, expectedMessage, 'got correct unsubscribe message');
        client.mockPublish(testPattern, null, testMessage);
    });
});

test('throws error without client', function(t) {
    t.plan(1);

    t.throws(function() {
        patternSubscriber(null, 'test', function() {
            t.fail('callback should not be called');
        });
    }, 'error thrown as expected');
});

test('throws error without pattern', function(t) {
    t.plan(1);

    var client = createClient();

    t.throws(function() {
        patternSubscriber(client, null, function() {
            t.fail('callback should not be called');
        });
    }, 'error thrown as expected');
});

test('throws error without callback', function(t) {
    t.plan(1);

    var client = createClient(),
    testPattern = 'test';

    t.throws(function() {
        patternSubscriber(client, testPattern, null);
    }, 'error thrown as expected');
});

test('handles subscribe and unsubscibe errors', function(t) {
    t.plan(5);
    var client = createClient(),
        testPattern = 'test',
        testError = 'Error!',
        testCallback = function(error, message) {
            t.equal(error, testError, 'got correct message');
            t.notOk(message, 'should not get message');
        };

        client._nextError = testError;
        var unsubscribe = patternSubscriber(client, testPattern, testCallback);
        unsubscribe(function(error, message){
            t.pass('unsubscribed');
            t.equal(error, testError, 'got correct message');
            t.notOk(message, 'should not get message');
    });
});
