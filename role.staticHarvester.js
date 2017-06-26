let utils = require('utils');

var roleStaticHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.full)
        {
            var link = Game.getObjectById(creep.memory.linkId);
            if(creep.transfer(link, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
            {
                creep.moveTo(link, {range: 1});
                //utils.moveTo(creep, link.pos, {range:1});
            }
            
            if(creep.carry.energy == 0)
            {
                creep.memory.full = false;
            }
            
        }
        else
        {
            const source = Game.getObjectById(creep.memory.sourceId);
            if(creep.memory.standX !== undefined && (creep.pos.x != creep.memory.standX || creep.pos.y != creep.memory.standY))
            {
                creep.moveTo(creep.memory.standX, creep.memory.standY);
                //utils.moveTo(creep, new RoomPosition(creep.memory.standX, creep.memory.standY, creep.room.name), {});
                
            }
            const harvestError = creep.harvest(source)
            if(harvestError == ERR_NOT_IN_RANGE) 
            {
                creep.moveTo(source, {range: 1});
                //utils.moveTo(creep, source.pos, {range: 1});
            }
            else if(harvestError == OK && creep.memory.travelTime === undefined)
            {
                creep.memory.travelTime = CREEP_LIFE_TIME - creep.ticksToLive;
            }
            
            var link = Game.getObjectById(creep.memory.linkId);
            creep.transfer(link, RESOURCE_ENERGY);
                
            if(creep.carry.energy > 0 && creep.carry.energy == creep.carryCapacity)
            {
                creep.memory.full = true;
            }
        }
	}
};

module.exports = roleStaticHarvester;