module.exports = function(logger) {
    if (!logger) {
        logger = console;
    }

    function unsubscribe(client, pattern, callback) {
        client.punsubscribe(pattern, function(error){
            if (error) {
                logger.error(error);
                return callback(error);
            }

            logger.info('Unsubscribed from ' + pattern);
            return callback(null, 'Unsubscribed from ' + pattern);
        });
    }

    return function(client, pattern, callback) {
        if (!callback) {
            throw 'No callback provided to subscribe to pattern: ' + pattern;
        }
        if (!pattern) {
            throw 'No pattern provided';
        }
        if (!client) {
            throw 'No client provided';
        }

        function callbackInstance(matchedPattern, channel, message) {
            if(matchedPattern === pattern) {
                return callback(null, message, channel);
            }
        }

        client.psubscribe(pattern, function(error) {
            if (error) {
                logger.error(error);
                return callback(error);
            }

            //TO DO: investigate doing this only once
            client.on('pmessage', callbackInstance);
        });

        return function unsubscribeFromPattern(callback) {
            client.removeListener('pmessage', callbackInstance);
            unsubscribe(client, pattern, callback);
        };
    };
};
