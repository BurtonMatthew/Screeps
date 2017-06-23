function spawn(spawner, source)
{
    const isMineral = "mineralAmount" in source
    if(isMineral && source.mineralAmount == 0)
    {
        return false;
    }
    
    const harvestCreep = Game.creeps["Harvest" + source.id];
    if(harvestCreep === undefined)
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
        spawner.createCreep(getBodyPartsHarvester(source, hasLink, isMineral), "Harvest" + source.id, creepMem);
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
                if(container)
                {
                    spawner.createCreep(getBodyPartsHauler(source), "Hauler" + source.id + i, 
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
            spawner.createCreep([MOVE, CARRY, CARRY], "StorageLink" + source.room.name, { role: 'storagelink', linkId: link.id });
            return true;
        }
        
        const refillerCreep = Game.creeps["Refiller" + source.room.name];
        if(refillerCreep === undefined)
        {
            spawner.createCreep([MOVE, MOVE, CARRY, CARRY], "Refiller" + source.room.name, { role: 'refiller', home: source.room.name });
            return true;
        }
    }
    return false;
}

function getBodyPartsHarvester(source, hasLink, isMineral)
{
    const maxAffordableWorkParts = Math.floor((source.room.energyCapacityAvailable - (hasLink ? 100 : 50)) / 100);
    const maxWorkParts = isMineral ?  Math.ceil(source.mineralAmount / source.ticksToRegeneration)
                                    : (Math.ceil(source.energyCapacity / 600)); // /600 derived from 300 regen ticks, 2 per part per tick
    var parts = [MOVE];
    if(hasLink)
        parts.push(CARRY);
    
    const numWork = Math.min(maxAffordableWorkParts, maxWorkParts);
    for(var i=0; i<numWork; ++i)
        parts.push(WORK);
        
    return parts;
}

function getBodyPartsHauler(source)
{
    var parts = [];
    const maxAffordableParts = Math.floor(source.room.energyCapacityAvailable  / 100);
    const maxUsefulParts = 8;
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