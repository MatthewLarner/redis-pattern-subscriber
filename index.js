var EventEmitter = require('events').EventEmitter;

module.exports = function(logger) {
    if (!logger) {
        logger = console;
    }

    function unsubscribePattern(client, pattern) {
        client.punsubscribe(pattern, function(error){
            if (error) {
                logger.error(error);
            }

            logger.info('Unsubscribed from ' + pattern);
        });
    }

    return function(client, pattern, subscribeCallback) {
        if (!subscribeCallback) {
            throw 'No callback provided to subscribe to pattern: ' + pattern;
        }
        if (!pattern) {
            throw 'No pattern provided';
        }
        if (!client) {
            throw 'No client provided';
        }

        var emitter = new EventEmitter();

        function callbackInstance(matchedPattern, channel, message) {
            if(matchedPattern === pattern) {
                emitter.emit('message', message, channel);
            }
        }

        client.psubscribe(pattern, function(error) {
            if (error) {
                logger.error(error);
                return subscribeCallback(error);
            }

            //TO DO: investigate doing this only once
            client.on('pmessage', callbackInstance);

            emitter.unsubscribe = function() {
                client.removeListener('pmessage', callbackInstance);
                emitter.removeAllListeners('message');
                unsubscribePattern(client, pattern);
            };

            subscribeCallback(null, emitter);
        });
    };
};
