var utils = require('utils');
var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) 
    {
        const targets = creep.room.find(FIND_HOSTILE_CREEPS);
        if(creep.room.name != creep.memory.home)
        {
            utils.navToRoom(creep, creep.memory.home);
        }
        //else if(targets.length > 0)
        //{
        //    var tower = creep.pos.findClosestByRange(FIND_MY_STRUCTURES);
        //    if(tower)
        //        creep.moveTo(tower);
        //}
        else if(creep.memory.full)
        {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) 
            {
                creep.moveTo(creep.room.controller);
            }
            
            if(creep.memory.linkId !== undefined)
            {
                Game.getObjectById(creep.memory.linkId)
            }
            
            if(creep.room.storage !== undefined)
            {
                creep.withdraw(creep.room.storage, RESOURCE_ENERGY);
            }
            
            if(creep.carry.energy == 0)
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