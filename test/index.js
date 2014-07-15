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
        testMessage = 'the message';

    var emitter = patternSubscriber(client, testPattern, function(error){
        t.notOk(error, 'should not error');
        client.mockPublish(testPattern, null, testMessage);

        if('message' in emitter._events){
            t.pass('emitter has events bound');
        }

        emitter.unsubscribe(function(error){
            t.pass('Unsubscribed');
            t.notOk(error, 'should not error');
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

test('handles unsubscribe errors', function(t) {
    t.plan(2);
    var client = createClient(),
        testPattern = 'test',
        testError = 'Error!';

    var emitter = patternSubscriber(client, testPattern, function(error){
        t.notOk(error, 'should not error');

        client._nextError = testError;

        emitter.unsubscribe(function(error){
            t.equal(error, testError, 'got correct error');
        });
    });
});

test('throws correct error when unsubscribe is called before subscription', function(t) {
    t.plan(3);
    var client = createClient(),
    testPattern = 'test';

    var emitter = patternSubscriber(client, testPattern, function(error){
        t.notOk(error, 'should not error');
    });

    try {
        emitter.unsubscribe(function() {
            t.fail('callback should not be called');
        });
    } catch (e) {
        t.pass('should throw');
        t.equal(e, 'unsubscribe called before subscription', 'got correct error message');
    }
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

test('handles multiple emitters correctly', function(t) {
    t.plan(10);
    var client = createClient(),
        testPattern = 'test',
        testPattern2 = 'test2',
        testMessage = 'the message';

    var emitter = patternSubscriber(client, testPattern, function(error){
        t.notOk(error, 'should not error');
        client.mockPublish(testPattern, null, testMessage);

        if('message' in emitter._events){
            t.pass('emitter has events bound');
        }

        emitter.unsubscribe(function(error){
            t.pass('Unsubscribed');
            t.notOk(error, 'should not error');
            client.mockPublish(testPattern, null, testMessage);

            if('message' in emitter._events){
                t.fail('emitter still has events bound');
            }
        });
    });

    var emitter2 = patternSubscriber(client, testPattern2, function(error){
        t.notOk(error, 'should not error');
        client.mockPublish(testPattern2, null, testMessage);
        client.mockPublish(testPattern, null, testMessage);

        if('message' in emitter._events){
            t.fail('emitter still has events bound');
        }

        if('message' in emitter2._events){
            t.pass('emitter2 has events bound');
        }

        emitter2.unsubscribe(function(error){
            t.pass('Unsubscribed');
            t.notOk(error, 'should not error');
            client.mockPublish(testPattern, null, testMessage);
            client.mockPublish(testPattern2, null, testMessage);

            if('message' in emitter._events){
                t.fail('emitter2 still has events bound');
            }
        });
    });

    emitter.on('message', function(message) {
        t.equal(message, testMessage, 'emiitter got correct message');
    });

    emitter2.on('message', function(message) {
        t.equal(message, testMessage, 'emiitter 2 got correct message');
    });
});

test('handles multiple clients correctly', function(t) {
    t.plan(5);
    var client = createClient(),
        client2 = createClient(),
        testPattern = 'test',
        testMessage = 'the message';

    var emitter = patternSubscriber(client, testPattern, function(error){
        t.notOk(error, 'should not error');
        client.mockPublish(testPattern, null, testMessage);
        client2.mockPublish(testPattern, null, testMessage);

        if('message' in emitter._events){
            t.pass('emitter has events bound');
        }

        emitter.unsubscribe(function(error){
            t.pass('Unsubscribed');
            t.notOk(error, 'should not error');
            client2.mockPublish(testPattern, null, testMessage);
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
