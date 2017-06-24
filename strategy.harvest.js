var utils = require('utils');

function spawn(source)
{
    const isMineral = "mineralAmount" in source
    if(isMineral && (source.mineralAmount == 0 || source.room.find(FIND_STRUCTURES, {filter: (struct)=> struct.structureType == STRUCTURE_EXTRACTOR}).length == 0))
    {
        return false;
    }
    
    const harvestCreepA = Game.creeps["HarvestA" + source.id];
    const harvestCreepB = Game.creeps["HarvestB" + source.id];
    var harvestCreep;
    if(harvestCreepA !== undefined && harvestCreepB !== undefined)
        harvestCreep = harvestCreepA.ticksToLive > harvestCreepB.ticksToLive ? harvestCreepA : harvestCreepB;
    else if(harvestCreepA !== undefined)
        harvestCreep = harvestCreepA;
    else if(harvestCreepB !== undefined)
        harvestCreep = harvestCreepB;
    else
        harvestCreep === undefined;
    
    if(harvestCreep === undefined  
        || (harvestCreep.memory.travelTime !== undefined && harvestCreep.ticksToLive < harvestCreep.memory.travelTime + (harvestCreep.body.length * CREEP_SPAWN_TIME)))
    {
        
        var creepMem = { role: 'staticharvester', full: false, sourceId: source.id, home: source.room.name };
        // Look for a link
        const link = source.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: (struct) => struct.structureType == STRUCTURE_LINK });
        const hasLink = !isMineral && link && source.pos.inRangeTo(link, 2);
        const container = source.pos.findClosestByRange(FIND_STRUCTURES, {filter: (struct) => struct.structureType == STRUCTURE_CONTAINER });
        if(hasLink)
        {
            creepMem.linkId = link.id;
        }
        else if(container && source.pos.isNearTo(container))
        {
            creepMem.standX = container.pos.x;
            creepMem.standY = container.pos.y;
        }
        utils.getClosestSpawner(source.pos).createCreep(getBodyPartsHarvester(source, hasLink, isMineral), "Harvest" + (harvestCreep == harvestCreepB ? "A" : "B") + source.id, creepMem);
        return true;
    }
    else if(harvestCreep.getActiveBodyparts(CARRY) == 0) // Drop miner
    {
        const dist = source.pos.getRangeTo(source.room.controller); // todo remote
        const numHarvesters = Math.ceil(dist / 20)

        for(var i=0; i<numHarvesters; ++i)
        {
            const haulerCreep = Game.creeps["Hauler" + source.id + i];
            if(haulerCreep === undefined)
            {
                const container = source.pos.findClosestByRange(FIND_STRUCTURES, {filter: (struct) => struct.structureType == STRUCTURE_CONTAINER });
                if(container && source.pos.isNearTo(container))
                {
                    utils.getClosestSpawner(source.pos).createCreep(getBodyPartsHauler(source, isMineral), "Hauler" + source.id + i, 
                        { role: 'hauler', full: false, containerId: container.id, resourceType: (isMineral ? source.mineralType : RESOURCE_ENERGY) });
                    return true;
                }
            }
        }
    }
    else
    {
        const storageLinkCreep = Game.creeps["StorageLink" + source.room.name];
        if(storageLinkCreep === undefined)
        {
            const link = source.room.storage.pos.findClosestByRange(FIND_STRUCTURES, {filter: (struct) => struct.structureType == STRUCTURE_LINK });
            utils.getClosestSpawner(link.pos).createCreep([MOVE, CARRY, CARRY], "StorageLink" + source.room.name, { role: 'storagelink', linkId: link.id });
            return true;
        }
        
        const refillerCreep = Game.creeps["Refiller" + source.room.name];
        if(refillerCreep === undefined)
        {
            utils.getAvailableSpawner(source.room).createCreep([MOVE, MOVE, CARRY, CARRY], "Refiller" + source.room.name, { role: 'refiller', home: source.room.name });
            return true;
        }
    }
    return false;
}

function getBodyPartsHarvester(source, hasLink, isMineral)
{
    const maxAffordableWorkParts = Math.floor((source.room.energyCapacityAvailable - (hasLink ? 100 : 50)) / 100);
    const maxWorkParts = isMineral ?  10 : (Math.ceil(source.energyCapacity / 600)); // /600 derived from 300 regen ticks, 2 per part per tick
    var parts = [MOVE];
    if(hasLink)
        parts.push(CARRY);
    
    const numWork = Math.min(maxAffordableWorkParts, maxWorkParts);
    for(var i=0; i<numWork; ++i)
        parts.push(WORK);
        
    return parts;
}

function getBodyPartsHauler(source, isMineral)
{
    var parts = [];
    const maxAffordableParts = Math.floor(source.room.energyCapacityAvailable  / 100);
    const maxUsefulParts = isMineral ? 2 : 8;
    const numPart = Math.min(maxAffordableParts, maxUsefulParts);
    for(var i=0; i<numPart; ++i)
    {
        parts.push(MOVE);
        parts.push(CARRY);
    }
        
    return parts;
}

module.exports = {
    spawn
};