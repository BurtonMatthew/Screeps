var utils = require('utils');
let bTree = require('behaviourTree');

 /** @param {Source} source 
  *  @param {Room} homeRoom 
  */
function spawn(source, homeRoom)
{
    var isDistance;
    if(homeRoom === undefined)
    {
        homeRoom = source.room;
        isDistance = false;
    }
    else
    {
        isDistance = true;
    }

    const isMineral = "mineralAmount" in source;
    if(isMineral && (source.mineralAmount == 0 || source.room.find(FIND_STRUCTURES, {filter: (struct)=> struct.structureType == STRUCTURE_EXTRACTOR}).length == 0))
    {
        return bTree.SUCCESS;
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
        harvestCreep = undefined;
    
    if(harvestCreep === undefined  
        || (harvestCreep.memory.travelTime !== undefined && harvestCreep.ticksToLive < harvestCreep.memory.travelTime + (harvestCreep.body.length * CREEP_SPAWN_TIME)))
    {
        
        var creepMem = { role: 'staticharvester', full: false, sourceId: source.id, home: homeRoom.name };
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
            creepMem.standRoom = container.pos.roomName;
        }
        const spawner = isDistance ? utils.getAvailableSpawner(homeRoom) : utils.getClosestSpawner(source.pos);
        spawner.createCreep(getBodyPartsHarvester(source, homeRoom, hasLink, isMineral), "Harvest" + (harvestCreep == harvestCreepB ? "A" : "B") + source.id, creepMem);
        return bTree.INPROGRESS;
    }
    else if(harvestCreep.getActiveBodyparts(CARRY) == 0) // Drop miner
    {
        const dist = source.pos.getRangeTo(source.room.controller); // todo remote
        const numHarvesters = isDistance ? 3 : Math.ceil(dist / 20);

        for(var i=0; i<numHarvesters; ++i)
        {
            const haulerCreep = Game.creeps["Hauler" + source.id + i];
            if(haulerCreep === undefined)
            {
                const container = source.pos.findClosestByRange(FIND_STRUCTURES, {filter: (struct) => struct.structureType == STRUCTURE_CONTAINER });
                if(container && source.pos.isNearTo(container))
                {
                    utils.getAvailableSpawner(homeRoom).createCreep(getBodyPartsHauler(source, homeRoom, isMineral), "Hauler" + source.id + i, 
                        { role: 'hauler', full: false, containerId: container.id, home:homeRoom.name, resourceType: (isMineral ? source.mineralType : RESOURCE_ENERGY) });
                    return bTree.INPROGRESS;
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
            return bTree.INPROGRESS;
        }
        
        const refillerCreep = Game.creeps["Refiller" + source.room.name];
        if(refillerCreep === undefined)
        {
            utils.getAvailableSpawner(source.room).createCreep([MOVE, CARRY, CARRY], "Refiller" + source.room.name, { role: 'refiller', home: source.room.name });
            return bTree.INPROGRESS;
        }
    }
    return bTree.SUCCESS;
}

function getBodyPartsHarvester(source, spawnRoom, hasLink, isMineral)
{
    const maxAffordableWorkParts = Math.floor((spawnRoom.energyCapacityAvailable - (hasLink ? 100 : 50) - (source.room !== spawnRoom ? 100 : 0)) / 100);
    const maxWorkParts = isMineral ?  10 : (Math.ceil(source.energyCapacity / 600)); // /600 derived from 300 regen ticks, 2 per part per tick
    var parts = [MOVE];
    if(hasLink)
        parts.push(CARRY);
    if(source.room !== spawnRoom)
    {
        parts.push(MOVE);
        parts.push(MOVE);
    }
    
    const numWork = Math.min(maxAffordableWorkParts, maxWorkParts);
    for(var i=0; i<numWork; ++i)
        parts.push(WORK);
        
    return parts;
}

function getBodyPartsHauler(source, spawnRoom, isMineral)
{
    var parts = [];
    const maxAffordableParts = Math.floor(spawnRoom.energyCapacityAvailable  / 150);
    const maxUsefulParts = isMineral ? 2 : 5;
    const numPart = Math.min(maxAffordableParts, maxUsefulParts);
    for(var i=0; i<numPart; ++i)
    {
        parts.push(MOVE);
        parts.push(CARRY);
        parts.push(CARRY);
    }
        
    return parts;
}

module.exports = {
    spawn
};