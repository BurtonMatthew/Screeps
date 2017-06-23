var mapM = require('map.memory');
var expansion = require('strategy.expansion');
var utils = require('utils');
var roomLayout = require('room.layout');

var roleExplorer =
{
    /** @param {Creep} creep **/
    run: function(creep) 
    {
        mapM.memorize(creep.room);
        
        if(creep.memory.targetRoom === undefined || creep.room.name == creep.memory.targetRoom)
        {
            creep.memory.targetRoom = mapM.getStaleRoom();
        }

        utils.navToRoom(creep, creep.memory.targetRoom);
        //creep.say("💔");
        //creep.say(expansion.getBestExpansionRoom());
        try
        {
            //roomLayout.visualize(roomLayout.createLayout(creep.room));
        }
        catch(err)
        {
            
        }
        
    }
};

module.exports = roleExplorer;