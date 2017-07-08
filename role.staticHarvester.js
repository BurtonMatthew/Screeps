let utils = require('utils');

var roleStaticHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) 
    {
        var didMove = false;
        if(utils.checkSwaps(creep))
        {
            // Todo: special case, if the new harvester wants to swap with us, just suicide
            didMove = true;
        }
        else if(creep.memory.full)
        {
            var link = Game.getObjectById(creep.memory.linkId);
            if(creep.transfer(link, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE && !didMove)
            {
                //creep.moveTo(link, {range: 1});
                didMove = utils.moveTo(creep, link, {range:1}) == OK;
            }
            
            if(creep.carry.energy == 0)
            {
                creep.memory.full = false;
            }
            
        }
        else
        {
            const source = Game.getObjectById(creep.memory.sourceId);
            if(creep.memory.standX !== undefined 
                && (creep.pos.x != creep.memory.standX 
                    || creep.pos.y != creep.memory.standY 
                    || creep.pos.roomName != creep.memory.standRoom) 
                && !didMove)
            {
                //creep.moveTo(creep.memory.standX, creep.memory.standY);
                try
                {
                    didMove = utils.moveTo(creep, new RoomPosition(creep.memory.standX, creep.memory.standY, creep.memory.standRoom)) == OK;
                }
                catch(err){}
            }
            const harvestError = creep.harvest(source)
            if(harvestError == ERR_NOT_IN_RANGE && !didMove) 
            {
                //creep.moveTo(source, {range: 1});
                didMove = utils.moveTo(creep, source, {range: 1}) == OK;
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