var mapM = require('map.memory');
var utils = require('utils');
var roomLayout = require('room.layout');

var roleExpander =
{
    /** @param {Creep} creep **/
    run: function(creep) 
    {
        if(creep.room.name != creep.memory.home)
        {
            utils.navToRoom(creep, creep.memory.home);
        }
        else if(!creep.room.controller.my)
        {
            if(creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE) 
            {
                creep.moveTo(creep.room.controller, {maxRooms:1});
            }
            
            if(creep.room.controller.my)
            {
                creep.room.memory.layout = roomLayout.createLayout(creep.room);
            }
        }
        else if(creep.room.memory === undefined)
        {
            creep.room.memory.layout = roomLayout.createLayout(creep.room);
        }
        else
        {
            //roomLayout.visualize(creep.room.memory.layout);
        }
    }
};

module.exports = roleExpander;