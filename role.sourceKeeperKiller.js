var utils = require('utils');
var roleSourceKeeperKiller =
{
    /** @param {Creep} creep **/
    run: function(creep) 
    {
        if(utils.checkSwaps(creep)) {}
        else if(creep.room.name != creep.memory.home)
        {
            utils.navToRoom(creep, creep.memory.home);
            if(creep.hits < creep.hitsMax)
                creep.heal(creep);
        }
        else
        {
            var target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);

            if(target)
            {
                if(creep.attack(target) !== OK)
                {
                    creep.moveTo(target, {range:1, maxRooms:1});
                    if(creep.hits < creep.hitsMax)
                    {
                        creep.heal(creep);
                    }
                }
            }
            else
            {
                var keeperLair = _(creep.room.find(FIND_STRUCTURES))
                    .filter((s) => s.structureType === STRUCTURE_KEEPER_LAIR)
                    .sortBy((s) => s.ticksToSpawn)
                    .head();

                    creep.moveTo(keeperLair, {range:1, maxRooms:1});
                    if(creep.hits < creep.hitsMax)
                    {
                        creep.heal(creep);
                    }
            }
        }
    }
};

module.exports = roleSourceKeeperKiller;