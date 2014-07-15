var EventEmitter = require('events').EventEmitter;

module.exports = function(logger) {
    if (!logger) {
        logger = console;
    }

    function unsubscribePattern(client, pattern, callback) {
        if(!callback) {
            callback = function(){};
        }

        client.punsubscribe(pattern, function(error){
            if (error) {
                logger.error(error);
                return callback(error);
            }

            logger.info('Unsubscribed from ' + pattern);
            callback(null, 'Unsubscribed from ' + pattern);
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

        emitter.unsubscribe = function(){
            if(!this._unsubscribe){
                throw 'unsubscribe called before subscription';
            }
            this._unsubscribe.apply(this, arguments);
        };

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

            var unsubscribe = function(unsubscribeCallback) {
                client.removeListener('pmessage', callbackInstance);
                emitter.removeAllListeners('message');
                unsubscribePattern(client, pattern, unsubscribeCallback);
            };

            emitter._unsubscribe = unsubscribe;

            subscribeCallback(null, emitter);
        });

        return emitter;
    };
};
