var utils = require('utils');
var roleStorageLink = {

    /** @param {Creep} creep **/
    run: function(creep) 
    {
        const link = Game.getObjectById(creep.memory.linkId);
        if(creep.room.memory.linkStorage === undefined)
        {
            creep.room.memory.linkStorage = link.id;
        }
        
        if(creep.room.memory.linkReqEnergy === undefined)
        {
            if(creep.withdraw(link, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) 
            {
                creep.moveTo(link);
            }
            if(creep.transfer(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) 
            {
                creep.moveTo(creep.room.storage);
            }
        }
        else
        {
            if(creep.withdraw(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) 
            {
                creep.moveTo(creep.room.storage);
            }
            if(creep.transfer(link, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) 
            {
                creep.moveTo(link);
            }
        }
        
        
	}
};

module.exports = roleStorageLink;