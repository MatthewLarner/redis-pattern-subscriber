var EventEmitter = require('events').EventEmitter;

module.exports = function() {
    var clientMock = new EventEmitter();

    clientMock._patterns = {};
    clientMock._nextError = null;

    clientMock.mockPublish = function(pattern, channel, message){
        this.emit('pmessage', pattern, channel, message);
    };

    clientMock.psubscribe = function(pattern, callback) {
        this._patterns[pattern] = true;

        return callback(this._nextError);
    };

    clientMock.punsubscribe = function(pattern, callback) {
        if (!this._patterns[pattern]) {
            return callback('subscription does not exist');
        }

        this._patterns[pattern] = false;

        return callback(this._nextError);
    };

    clientMock.on = function() {
        EventEmitter.prototype.on.apply(this, arguments);
    };

    clientMock.removeListener = function() {
        EventEmitter.prototype.removeListener.apply(this, arguments);
    };

    return clientMock;
};
