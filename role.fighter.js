var utils = require('utils');
var roleFighter =
{
    /** @param {Creep} creep **/
    run: function(creep) 
    {
        const targets = creep.room.find(FIND_HOSTILE_CREEPS);
        
        if(targets.length > 0) 
        {
            if(creep.attack(targets[0]) == ERR_NOT_IN_RANGE) 
            {
                creep.moveTo(targets[0]);
            }
        }
        else if(creep.room.name != creep.memory.home)
        {
            utils.navToRoom(creep, creep.memory.home);
        }
    }
};

module.exports = roleFighter;