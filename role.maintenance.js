var utils = require('utils');
let c = require('consts');

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
                    creep.moveTo(target, {maxRooms:1});
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
                            return structure.hits 
                            && structure.hits < structure.hitsMax * .7 
                            && structure.structureType != STRUCTURE_WALL
                            && structure.structureType != STRUCTURE_RAMPART;
                        }});
                
                if(!maintTarget)
                {
                    maintTarget = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return structure.hits
                            && structure.hits < structure.hitsMax * .05 
                            && structure.structureType == STRUCTURE_RAMPART;
                        }
                    });
                }
                
                if(!maintTarget)
                {
                    maintTarget = _(creep.room.find(FIND_STRUCTURES))
                                    .filter((struct) => struct.hits)
                                    .sortBy((struct) => (struct.hits / struct.hitsMax))
                                    .first();
                }
                
                if(maintTarget)
                {
                    creep.memory.target = maintTarget.id;
                }
                else if(creep.room.find(FIND_MY_CONSTRUCTION_SITES).length > 0)
                {
                    creep.memory.role = c.ROLE_BUILDER;
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