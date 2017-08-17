var mapM = require('map.memory');
var utils = require('utils');

var roleReserver =
{
    /** @param {Creep} creep **/
    run: function(creep) 
    {
        if(creep.room.name != creep.memory.home)
        {
            utils.navToRoom(creep, creep.memory.home);
        }
        else if(creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE) 
        {
            creep.moveTo(creep.room.controller, {range:1, maxRooms:1});
        }
    }
};

module.exports = roleReserver;