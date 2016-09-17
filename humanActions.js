var roomManager = require("roomManager");
var hivemind = require("hivemind");
var humanActions = {

  setGoal : function(goalName) {
    hivemind._setGoal(goalName);
  }
};

module.exports = humanActions;
