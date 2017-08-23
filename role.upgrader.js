var utils = require('utils');
var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) 
    {
        if(utils.checkSwaps(creep)) {}
        else if(creep.room.name != creep.memory.home)
        {
            utils.navToRoom(creep, creep.memory.home);
        }
        else if(creep.memory.full)
        {
            const upgradeError = creep.upgradeController(creep.room.controller)
            if(upgradeError == ERR_NOT_IN_RANGE) 
            {
                //creep.moveTo(creep.room.controller);
                creep.moveTo(creep.room.controller, {range:2});
            }
            
            else if(upgradeError == OK && creep.memory.travelTime === undefined)
            {
                creep.memory.travelTime = CREEP_LIFE_TIME - creep.ticksToLive;
            }

            //creep.moveTo(creep.room.controller, {range:1});
            
            if(creep.memory.linkId !== undefined)
            {
                const link = Game.getObjectById(creep.memory.linkId);
                if(creep.withdraw(link, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                    //creep.moveTo(link);
                    utils.moveTo(creep, link, {range:1});
                    
                if(link.energy <= 200 && creep.room.memory.linkReqEnergy === undefined)
                    creep.room.memory.linkReqEnergy = link.id;
            }
            
            if(creep.room.storage !== undefined && creep.carry[RESOURCE_ENERGY] <= creep.getActiveBodyparts(WORK))
            {
                creep.withdraw(creep.room.storage, RESOURCE_ENERGY);
            }
            
            if(creep.memory.linkId === undefined && creep.carry.energy == 0)
            {
                creep.memory.full = false;
            }
        }
        else
        {
            creep.memory.full = utils.fillEnergy(creep);
        }
	}
};

module.exports = roleUpgrader;