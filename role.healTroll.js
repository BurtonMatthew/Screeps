var utils = require('utils');
var roleHealTroll =
{
    /** @param {Creep} creep **/
    run: function(creep) 
    {
        if(utils.checkSwaps(creep)) {}
        else if(creep.room.name != creep.memory.home && creep.hits == creep.hitsMax)
        {
            utils.navToRoom(creep, creep.memory.home);
            if(creep.hits < creep.hitsMax)
                creep.heal(creep);
        }
        else if(creep.hits < creep.hitsMax)
        {
            creep.heal(creep);
            if(creep.hits < creep.hitsMax / 2)
            {
                utils.navToRoom(creep, "E37S4");
            }
        }
    }
};

module.exports = roleHealTroll;