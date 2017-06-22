var roleLinkUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.full)
        {
            var controller = creep.room.controller;
            if(creep.upgradeController(controller) == ERR_NOT_IN_RANGE)
            {
                creep.moveTo(controller);
            }
            
            var source = Game.getObjectById(creep.memory.linkId);
            creep.withdraw(source, RESOURCE_ENERGY);
            
            if(creep.carry.energy == 0)
            {
                creep.memory.full = false;
            }
        }
        else
        {
            var source = Game.getObjectById(creep.memory.linkId);
            if(creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) 
            {
                creep.moveTo(source);
            }
                
            if(creep.carry.energy == creep.carryCapacity)
            {
                creep.memory.full = true;
            }
        }
	}
};

module.exports = roleLinkUpgrader;