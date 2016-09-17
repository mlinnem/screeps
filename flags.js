/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('flags');
 * mod.thing == 'a thing'; // true
 */
var flags = {
    WAITING_ROOM : {"primary" : 8} //TODO: Game currently uses strings for colors on flags, but numbers in lookup table. This is a hack.
}

module.exports = flags;