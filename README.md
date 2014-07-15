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
    var subscribe = createSubscriber(logger);

    // Function Scope

    subscribe(client, 'abc123', function(error, subscription){
        if(error){
            //subscription failed, do something.
        }

        // subscription succeeded

        subscription.on('message', function(message, channel) {
            // do something with message

            if(message === 'destroy') {
                subscription.unsubscribe();
            }
        });

        // ... or later ...
        subscription.unsubscribe();
    });

    // Variable

    var subscription = subscribe(client, 'a*redis*pattern', function(error){
        if(error) {
            //subscription failed, do something.
        }
    });

    subscription.on('message', function(message, channel) {
            // do something with message

        if(message === 'destroy'){
            this.unsubscribe();
        }
    });

    // Chaining

    subscribe(client, 'abc123*', function(error){
        if(error) {
            //subscription failed, do something.
        }
    }).on('message', function(message, channel) {
        // do something with message

        if(message === 'destroy'){
            subscription.unsubscribe();
            this.unsubscribe();
        }
    });
