var notifications = {
    FORGET_RATE_PER_TURN: 3,
    UPDATE_FORGET_EVERY_X_TURNS: 1,

    forget: function() {
        if (Game.time % this.UPDATE_FORGET_EVERY_X_TURNS == 0) {
            for (var realKey in Memory.hivemind) {
                var key = this._getKey(realKey);
                this._setSeverity(key, this._getSeverity(key) - this.FORGET_RATE_PER_TURN * this.UPDATE_FORGET_EVERY_X_TURNS); // (this.FORGET_RATE_PER_TURN * this.UPDATE_FORGET_EVERY_X_TURNS)
                if (this._getSeverity(key) <= 0) {
                    this._removeKey(key);
                }
            }
        }
    },

    eraseAllMemory: function() {
        console.log("ERASING ALL HIVEMIND MEMORY");
        for (var realKey in Memory.hivemind) {
            var key = this._getKey(realKey);
            this._removeKey(key);
        }
        return "erased";
    },

    _setSeverity: function(key, value) {
        var realKey = JSON.stringify(key);
        Memory.hivemind[realKey] = value;
    },

    _getSeverity: function(key) {
        return Memory.hivemind[JSON.stringify(key)];
    },

    _getKey: function(key) {
        return JSON.parse(key);
    },

    _removeKey: function(key) {
        delete Memory.hivemind[JSON.stringify(key)];
    },

    STANDARD_SEVERITY: 12,

    //TODO: All this can probably be more optimized. Lots of stringifying going on.
    notify: function(creep, status) {
        var key = {
            "behavior": creep.memory.behavior,
            "result": status["result"]
        };
        if (status["succeeded"]) {
            //it worked, so business as usual, no need to record.
            return;
        }
        //console.log("Notifying for the following status:" + status["message"]);
        if (this._getSeverity(key)) {
            this._setSeverity(key, this._getSeverity(key) + this.STANDARD_SEVERITY); //TODO: Severity dependent on particular circumstances
        } else {
            this._setSeverity(key, this.STANDARD_SEVERITY);
        }
    },

    showStatus: function() {


        //TODO: This sorting is guaranteed jank.

        var sortable = [];
        for (var realKey in Memory.hivemind) {
            sortable.push({
                "key": realKey,
                "value": Memory.hivemind[realKey]
            });
        }

        sortable.sort(
            function(a, b) {
                return (b["value"] - a["value"]);
            });

        for (var i = 0; i < sortable.length; i++) {
            var thing = sortable[i];
            var status = JSON.parse(thing["key"]);
            console.log(thing["value"] + "\t: " + status["behavior"] + " + " + status["result"]);
        }
    },
};

module.exports = notifications;
