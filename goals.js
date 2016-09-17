var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleFerrier = require('role.ferrier');
var roleMiner = require("role.miner");

var behaviors = require("behaviors");
var notifications = require("notifications");

var bodies = require("bodies");

var u = require("u");

//0.0 goal: 5 workers.
//0.1 goal: upgrade to lvl 1
//1.1 goal: roads to source. [switch to road guys]
//1.2 goal: roads to far source.
//1.3 5 workers for far source [5 more workers for source]
//1.4 roads to upgrade
//1.5 upgrade to lvl 2
//2.0 up to 5 extensions (at source 1, a little source 2).
//2.1 containers at each source, extension. [switch to ferriers and miners]
//2.2 walls and ramparts?
//2.3 upgrade to lvl 3
//3.0 build up to 10 extensions (at source 1, 2, and in between).
//3.1 build tower.
//3.2 upgrade to lvl 4
//4.0 up to 20 extensions
//4.1 storage
//4.2 build up storage a bit.
//4.3 upgrade to lvl 5.
//5.0 up to 30 extensions. Another tower. SET UP LINKS [NEEDS MORE LOGIC]



var goals = {
    LEVELSTATUS_ACCOMPLISHED_GOAL: "Accomplished Goal",
    LEVELSTATUS_PROGRESSING_GOAL: "Progressing Towards Goal",
    LEVELSTATUS_NEEDS_HUMAN_INTERVENTION: "Needs Human Intervention",

    level1_buildUpWorkers: function() {
        var TARGET_NUM_WORKERS = 5;
        var goal = `Create ${TARGET_NUM_WORKERS} workers.`;

        var roleTargets = [];

        roleTargets.push(u.roleTarget(u.ROLE.WORKER, 5, bodies.lvl0_shorthaul));
        this._populateRoleTargets(roleTargets);

        var creepRolesAndCounts = u.getCreepRolesAndCounts();
        var numWorkers = creepRolesAndCounts[u.ROLE.WORKER];
        if (numWorkers == null) {
            numWorkers = 0;
        }

        var progress = numWorkers;
        var progressTotal = TARGET_NUM_WORKERS;
        var percent = Math.round(progress / progressTotal * 100);

        if (numWorkers >= TARGET_NUM_WORKERS) {
            return u.goalStatus(goal, true, percent, this.LEVELSTATUS_ACCOMPLISHED_GOAL, `Created initial set of ` + TARGET_NUM_WORKERS + `  workers!`);
        } else {
            return u.goalStatus(goal, false, percent, this.LEVELSTATUS_PROGRESSING_GOAL, `Created ` + numWorkers + ` out of ${TARGET_NUM_WORKERS} so far.`);
        }
    },

    level1_upgradeTo2: function() {
        var goal = "Upgrade controller to level 2";

        var spawn = Game.spawns["Spawn1"];
        var controller = spawn.room.controller;
        var progress = controller.progress;
        var progressTotal = controller.progressTotal;
        var percent = Math.round(progress / progressTotal * 100);

        var roleTargets = [];
        roleTargets.push(u.roleTarget(u.ROLE.WORKER, 6, bodies.lvl0_longhaul));
        this._populateRoleTargets(roleTargets, true);

        if (controller.level >= 2) {
            return u.goalStatus(goal, true, percent, this.LEVELSTATUS_ACCOMPLISHED_GOAL, "Fully upgraded to level 1!");
        } else {
            return u.goalStatus(goal, false, percent, this.LEVELSTATUS_PROGRESSING_GOAL, percent + "% complete. (" + progress + "/" + progressTotal + ")");
        }
    },

    level1_buildRoadsToSource: function(room) {
        var goal = "Build roads between the close source and the spawn.";

        var roleTargets = [];
        roleTargets.push(u.roleTarget(u.ROLE.WORKER, 4, bodies.lvl0_shorthaul));
        roleTargets.push(u.roleTarget(u.ROLE.UPGRADER, 1, bodies.lvl0_longhaul));
        this._populateRoleTargets(roleTargets, true);

        var roadsLeftToBuild = room.find(FIND_CONSTRUCTION_SITES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_ROAD);
            }
        });

        var numRoadsLeftToBuild = roadsLeftToBuild.length;

        var roadsThatCurrentlyExist =room.find(FIND_STRUCTURES, {filter:function(structure) { return structure.structureType == STRUCTURE_ROAD}});

        var numRoads = roadsThatCurrentlyExist.length;

        if (numRoadsLeftToBuild == 0 && numRoads == 0) {
          return u.goalStatus(goal, false, 0, this.LEVELSTATUS_NEEDS_HUMAN_INTERVENTION, "Human, please set some roads as construction sites please!");
        }

        var percentProgress = Math.floor((numRoads / (numRoads + numRoadsLeftToBuild)) * 100);
        if (numRoadsLeftToBuild > 0) {
            return u.goalStatus(goal, false, percentProgress, this.LEVELSTATUS_PROGRESSING_GOAL, numRoadsLeftToBuild + " roads out of " + roadsThatCurrentlyExist + " left to build.");
        } else if (numRoads > 0 && numRoadsLeftToBuild == 0) {
            return u.goalStatus(goal, true, percentProgress, this.LEVELSTATUS_ACCOMPLISHED_GOAL, "All the roads were built! (hopefully, between the source and the spawn point)");
        }

        console.log("WHY END SO SOON!");
    },


    level2_buildExtensions: function(room) {
      var goal = "Build extensions (0 -> 5)";

      var roleTargets = [];
      roleTargets.push(u.roleTarget(u.ROLE.WORKER, 4, bodies.lvl0_shorthaul));
      roleTargets.push(u.roleTarget(u.ROLE.UPGRADER, 1, bodies.lvl0_longhaul));
      this._populateRoleTargets(roleTargets, true);

      var extensionsLeftToBuild = room.find(FIND_CONSTRUCTION_SITES, {
          filter: (structure) => {
              return (structure.structureType == STRUCTURE_EXTENSION);
          }
      });

      var numExtensionsLeftToBuild = extensionsLeftToBuild.length;

      var extensionsThatCurrentlyExist = room.find(STRUCTURE_EXTENSION);
      var numExtensions = extensionsThatCurrentlyExist.length;

      console.log("FOOF" + numExtensionsLeftToBuild);
      if (numExtensionsLeftToBuild == 0 && numExtensions == 0) {
        return u.goalStatus(goal, false, 0, this.LEVELSTATUS_NEEDS_HUMAN_INTERVENTION, "Human, please set some extensions as construction sites please!");
      }

      var percentProgress = Math.floor((numExtensions / (numExtensions + numExtensionsLeftToBuild)) * 100);

      if (numExtensionsLeftToBuild > 0) {
          console.log("This should be triggered yes");
          return u.goalStatus(goal, false, percentProgress, this.LEVELSTATUS_PROGRESSING_GOAL, numExtensionsLeftToBuild + " extensions out of " + extensionsThatCurrentlyExist + " left to build.");
      } else if (numExtensions > 0 && numExtensionsLeftToBuild == 0) {
          return u.goalStatus(goal, true, percentProgress, this.LEVELSTATUS_ACCOMPLISHED_GOAL, "All the extensions were built!");
      }
    },





    level3_upgradeto4: function() {
        //MISSION: UPGRADE TO NEXT LEVEL, MAINTAIN, DO A LITTLE BUILDING MAYBE

        var spawn = Game.spawns["Spawn1"];
        var controller = spawn.room.controller;
        var progress = controller.progress;
        var progressTotal = controller.progressTotal;
        var percentProgress = Math.round(progress / progressTotal * 100);
        //console.log("CURRENT GOAL: Upgrade to goal 6: " + percentProgress + "% PROGRESS. (" + progress + "/" + progressTotal + ")");
        var storage = u.getStorage();
        var energyInStorage = storage.store[RESOURCE_ENERGY];
        var targetEnergyInStorage = 50000;
        var percentProgressStorage = Math.round((energyInStorage / targetEnergyInStorage) * 100);
        console.log("CURRENT GOAL: Store " + targetEnergyInStorage + " energy for populating new room: " + percentProgressStorage + "% complete.");
        //TODO: Take range into account, listen to signals etc.

        roleTargets = [];
        roleTargets.push(u.roleTarget(u.ROLE.MINER, 9, bodies.lvl3_nohaulwalkish));
        roleTargets.push(u.roleTarget(u.ROLE.FERRIER, 4, bodies.lvl3_allhaul));
        roleTargets.push(u.roleTarget(u.ROLE.BUILDER, 2, bodies.lvl3_constructer_carry));
        //roleTargets.push(u.roleTarget(u.ROLE.CONSTRUCTER, 1, bodies.lvl3_constructer));
        roleTargets.push(u.roleTarget(u.ROLE.UPGRADER, 3, bodies.lvl3_nohaul));
        roleTargets.push(u.roleTarget(u.ROLE.REPAIRER, 1, bodies.lvl3_repairer_worky));

        console.log("My this is " + this);
        this._populateRoleTargets(roleTargets, true);

        //TODO: Return true or false
    },

    level6_buildMoreExtensions: function() {
        var extensions = Game.spawns["Spawn1"].room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION);
            }
        });

        var spawn = Game.spawns["Spawn1"];
        var controller = spawn.room.controller;
        var numExtensions = extensions.length;
        var progress = extensions.length - 30;
        var progressTotal = 40; //target number of extensions built.
        var percentProgress = Math.round(progress / progressTotal * 100);

        console.log("CURRENT GOAL: Build up from 30 to 40 extensions:" + percentProgress + "% complete. (" + numExtensions + "/" + progressTotal + ")");

        roleTargets = [];
        roleTargets.push(u.roleTarget(u.ROLE.MINER, 9, bodies.lvl3_nohaulwalkish));
        roleTargets.push(u.roleTarget(u.ROLE.FERRIER, 4, bodies.lvl3_allhaul));
        roleTargets.push(u.roleTarget(u.ROLE.BUILDER, 4, bodies.lvl3_constructer_carry));
        //roleTargets.push(u.roleTarget(u.ROLE.CONSTRUCTER, 1, bodies.lvl3_constructer));
        roleTargets.push(u.roleTarget(u.ROLE.UPGRADER, 1, bodies.lvl3_nohaul));
        roleTargets.push(u.roleTarget(u.ROLE.REPAIRER, 1, bodies.lvl3_repairer));

        this._populateRoleTargets(roleTargets, true);

        if (numExtensions == 40) {
            return true;
        } else {
            return false;
        }
    },

    level6_upgradeTo7: function() {
        var goal = "Upgrade to level 7.";
        var extensions = Game.spawns["Spawn1"].room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION);
            }
        });

        var spawn = Game.spawns["Spawn1"];
        var controller = spawn.room.controller;
        var progress = controller.progress;
        var progressTotal = controller.progressTotal;
        var percentProgress = Math.round(progress / progressTotal * 100);

        //console.log("CURRENT GOAL: Upgrade to level 7:" + percentProgress + "% complete. (" + progress + "/" + progressTotal + ")");

        roleTargets = [];
        roleTargets.push(u.roleTarget(u.ROLE.MINER, 9, bodies.lvl3_nohaulwalkish));
        roleTargets.push(u.roleTarget(u.ROLE.FERRIER, 4, bodies.lvl3_allhaul));
        roleTargets.push(u.roleTarget(u.ROLE.BUILDER, 0, bodies.lvl3_constructer_carry));
        //roleTargets.push(u.roleTarget(u.ROLE.CONSTRUCTER, 1, bodies.lvl3_constructer));
        roleTargets.push(u.roleTarget(u.ROLE.UPGRADER, 4, bodies.lvl3_nohaul));
        roleTargets.push(u.roleTarget(u.ROLE.REPAIRER, 1, bodies.lvl3_repairer));
        this._populateRoleTargets(roleTargets, true);

        if (controller.level >= 7) {
            return u.goalStatus(goal, true, percentProgress, this.LEVELSTATUS_ACCOMPLISHED_GOAL, "Fully upgraded to level 7!");
        } else {
            return u.goalStatus(goal, false, percentProgress, this.LEVELSTATUS_PROGRESSING_GOAL, percentProgress + "% complete. (" + progress + "/" + progressTotal + ")");
        }
    },

    _populateRoleTargets: function(roleTargets, printIt) {
        //TODO: Handle order of creation a bit better. Think about jumpstart situation.
        var creepRolesAndCounts = u.getCreepRolesAndCounts();
        for (var i = 0; i < roleTargets.length; i++) {
            //  console.log("role target #:" + i);
            var roleTarget = roleTargets[i];
            var role = roleTarget["role"];
            var currentCount = creepRolesAndCounts[role];
            //  console.log("role " + role + " current count " + currentCount);
            if (!currentCount) {
                currentCount = 0
            };
            var targetCount = roleTarget["count"];
            var spawn = Game.spawns["Spawn1"];
            if (printIt) {
                console.log(role + ": " + currentCount + "/" + targetCount);
            }
            var belowCount = currentCount < targetCount;
            var canCreate = spawn.canCreateCreep(roleTarget["body"]);
            //  console.log( role + "is below count? " + belowCount);
            //console.log("" + canCreate + ": Can create " + role + " with body " + roleTarget["body"]);
            if (currentCount < targetCount && (spawn.canCreateCreep(roleTarget["body"])) == OK) {
                spawn.createCreep(roleTarget["body"], undefined, {
                    "role": role,
                    behavior: roleTarget.INITIAL_BEHAVIOR,
                    history: [],
                });
                //console.log("Spawning new " + role + " with body " + roleTarget["body"]);
            }
        }
    },
}

module.exports = goals;
