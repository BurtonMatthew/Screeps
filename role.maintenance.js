var utils = require('utils');

var roleMaintenance = {

    /** @param {Creep} creep **/
    run: function(creep) {
        const hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
        
        if(utils.checkSwaps(creep)) {}
        else if(creep.room.name != creep.memory.home)
        {
            utils.navToRoom(creep, creep.memory.home);
        }
        else if(creep.memory.full)
        {
            var target = Game.getObjectById(creep.memory.target);
            if(target) 
            {
                if(creep.repair(target) == ERR_NOT_IN_RANGE) 
                {
                    creep.moveTo(target);
                }
                else if(target.hits == target.hitsMax)
                {
                   creep.memory.target = "";
                }
            }
            else
            {
                var maintTarget = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return structure.hits < structure.hitsMax * .7 
                            && structure.structureType != STRUCTURE_WALL
                            && structure.structureType != STRUCTURE_RAMPART;
                        }});
                
                if(!maintTarget)
                {
                    maintTarget = creep.memory.target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return structure.hits < structure.hitsMax * .95 
                            && structure.structureType == STRUCTURE_RAMPART;
                        }
                    });
                }
                
                if(!maintTarget)
                {
                    maintTarget = creep.memory.target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (structure) => { return structure.hits < structure.hitsMax; }
                    });
                }
                
                if(maintTarget)
                {
                    creep.memory.target = maintTarget.id;
                }
            }
            
            if(creep.carry.energy == 0)
            {
                creep.memory.full = false;
            }
        }
        else
        {
            if(creep.ticksToLive < 100)
            {
                creep.suicide();
            }
            else if(utils.fillEnergy(creep))
            {
                creep.memory.full = true;
                creep.memory.target = "";
            }
        }
	}
};

module.exports = roleMaintenance;