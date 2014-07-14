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
        testMessage = 'the message';

    var emitter = patternSubscriber(client, testPattern, function(error){
        t.notOk(error, 'should not error');
        client.mockPublish(testPattern, null, testMessage);
        client.mockPublish(testPattern2, null, testMessage);
    });

    emitter.on('message', function(message) {
        t.equal(message, testMessage, 'got correct message');
    });
});

test('unsubscribes correctly', function(t) {
    t.plan(5);
    var client = createClient(),
        testPattern = 'test',
        testMessage = 'the message',
        expectedMessage = 'Unsubscribed from ' + testPattern;

    var emitter = patternSubscriber(client, testPattern, function(){
        client.mockPublish(testPattern, null, testMessage);

        if('message' in emitter._events){
            t.pass('emitter has events bound');
        }

        emitter.unsubscribe(function(error, message){
            t.pass('Unsubscribed');
            t.notOk(error, 'should not error');
            t.equal(message, expectedMessage, 'got correct unsubscribe message');
            client.mockPublish(testPattern, null, testMessage);

            if('message' in emitter._events){
                t.fail('emitter still has events bound');
            }
        });
    });

    emitter.on('message', function(message) {
        t.equal(message, testMessage, 'got correct message');
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

test('handles subscribe errors', function(t) {
    t.plan(1);
    var client = createClient(),
        testPattern = 'test',
        testError = 'Error!';

    client._nextError = testError;

    patternSubscriber(client, testPattern, function(error){
        t.equal(error, testError, 'got correct error');
    });
});

test('handles unsubscribe errors', function(t) {
    t.plan(1);
    var client = createClient(),
        testPattern = 'test',
        testError = 'Error!';

    client._nextError = testError;

    var emitter = patternSubscriber(client, testPattern, function(){
            emitter.unsubscribe(function(error){
                t.equal(error, testError, 'got correct error');
            });
        });
});
