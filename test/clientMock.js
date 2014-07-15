var EventEmitter = require('events').EventEmitter;

module.exports = function() {
    var clientMock = new EventEmitter();

    clientMock._patterns = {};
    clientMock._nextError = null;

    clientMock.mockPublish = function(pattern, channel, message){
        this.emit('pmessage', pattern, channel, message);
    };

    clientMock.psubscribe = function(pattern, callback) {
        var client = this;

        this._patterns[pattern] = true;

        setTimeout(function(){
            callback(client._nextError);
        });
    };

    clientMock.punsubscribe = function(pattern, callback) {
        var client = this;

        if (!this._patterns[pattern]) {
            return callback('subscription does not exist');
        }

        this._patterns[pattern] = false;

        setTimeout(function(){
            callback(client._nextError);
        });
    };

    clientMock.on = function() {
        EventEmitter.prototype.on.apply(this, arguments);
    };

    clientMock.removeListener = function() {
        EventEmitter.prototype.removeListener.apply(this, arguments);
    };

    return clientMock;
};
