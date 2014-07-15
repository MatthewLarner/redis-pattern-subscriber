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

    subscribe(client, 'thing*', function(error, emitter){
        var count = 0;

        if(error) {
            return console.log(error);
        }

        emitter.on('message', function(message, channel) {

            console.log('MESSAGE: '+ message + ' CHANNEL: ' + channel);

            count++;
            if(count >= 5) {
                emitter.unsubscribe();
            }
        });
    });
