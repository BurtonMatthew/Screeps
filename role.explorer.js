let mapM = require('map.memory');
let expansion = require('strategy.expansion');
let utils = require('utils');
let roomLayout = require('room.layout');

var roleExplorer =
{
    /** @param {Creep} creep **/
    run: function(creep) 
    {
        if(creep.memory.targetRoom === undefined || creep.room.name == creep.memory.targetRoom)
        {
            mapM.memorize(creep.room);
            creep.memory.targetRoom = mapM.getStaleRoom();
        }

        utils.navToRoom(creep, creep.memory.targetRoom);
        //creep.say("💔");
        //console.log(expansion.getBestExpansionRoom());
        try
        {
            //roomLayout.visualize(creep.room, roomLayout.createBaseLayout(creep.room));
        }
        catch(err)
        {
            console.log(err);
        }
        
    }
};

module.exports = roleExplorer;