var utils = require('utils');
var roleStorageLink = {

    /** @param {Creep} creep **/
    run: function(creep) 
    {
        const link = Game.getObjectById(creep.memory.linkId);
        if(link.energy > 0)
        {
            if(creep.withdraw(link, RESOURCE_ENERGY, Math.min(creep.carryCapacity - creep.carry.energy, link.energy)) == ERR_NOT_IN_RANGE) 
            {
                creep.moveTo(link);
            }
        }
        else
        {
            if(creep.room.memory.linkReqEnergy === undefined)
            {
                creep.room.memory.linkReqEnergy = link.id;
            }
        }
        
        if(creep.transfer(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) 
        {
            creep.moveTo(creep.room.storage);
        }
	}
};

module.exports = roleStorageLink;