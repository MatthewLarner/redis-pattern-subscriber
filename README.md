# redis-pattern-subscriber

Clean subscribe / unsubscribe to redis channels by pattern.

## Why

An easy way to listen to messages from pattern matched channels.
Removes need to manually handle remove listeners on unsubscribe.

## Usage

install

    npm install redis-pattern-subscriber

require

    // require the module
    var createSubscriber = require('redis-pattern-subscriber');

    // Initalise the module with a logger (optional, defaults to console)
    var subscriber = createSubscriber(logger);

    // subscribe to a pattern
    var emitter = subscribe(client, pattern, callback);

    // listen to messages
    emitter.on('message', callback);

where:
 - client is a redis client
 - pattern is a redis pattern
 - callback is called when the subscription is ready.

## example

    var createSubscriber = require('redis-pattern-subscriber');
    var subscriber = createSubscriber(logger);

    var emitter = subscribe(client, 'abc123', function(error, unsubscribe){
        if(error){
            //subscription failed, do something.
        }

        // subscription succeeded

        // ... later ...
        unsubscribe();

    });

    emitter.on('message', function(message){
        // do something with message
    });

