var utils = require('utils');
let bTree = require('behaviourTree');

function spawn(controller)
{
    if(controller === undefined || !controller.my)
        return bTree.FAIL;
        
    if(controller.room.storage !== undefined && controller.pos.inRangeTo(controller.room.storage, 3))
    {
        if(Game.creeps["Upgrader" + controller.room.name] === undefined)
        {
            utils.getClosestSpawner(controller.pos).createCreep(getBodyPartsUpgraderStatic(controller.room), "Upgrader" + controller.room.name
                , { role: 'upgrader', full: false, home: controller.room.name });
            return bTree.SUCCESS;
        }
    }
    else if(controller.level >= 6) // Super hacky way to see if we're a link based controller, only applies to starting room
    {
        const upgraderCreepA = Game.creeps["UpgraderA" + controller.room.name];
        const upgraderCreepB = Game.creeps["UpgraderB" + controller.room.name];
        var upgraderCreep;
        if(upgraderCreepA !== undefined && upgraderCreepB !== undefined)
            upgraderCreep = upgraderCreepA.ticksToLive > upgraderCreepB.ticksToLive ? upgraderCreepA : upgraderCreepB;
        else if(upgraderCreepA !== undefined)
            upgraderCreep = upgraderCreepA;
        else if(upgraderCreepB !== undefined)
            upgraderCreep = upgraderCreepB;
        else
            upgraderCreep = undefined;
        
        if(upgraderCreep === undefined
            || (upgraderCreep.memory.travelTime !== undefined && upgraderCreep.ticksToLive < upgraderCreep.memory.travelTime + (upgraderCreep.body.length * CREEP_SPAWN_TIME)))
        {
            const link = controller.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: (struct) => struct.structureType == STRUCTURE_LINK});
            utils.getClosestSpawner(controller.pos).createCreep(getBodyPartsUpgraderStatic(controller.room), "Upgrader" + (upgraderCreep == upgraderCreepB ? "A" : "B") + controller.room.name
                , { role: 'upgrader', full: true, home: controller.room.name, linkId: link.id});
            return bTree.SUCCESS;
        }
    }
    // No good tech, upgrader swarm!
    else
    {
        return utils.spawnToCount(_.partial(utils.getAvailableSpawner, controller.room), 4,
                getBodyPartsUpgraderSwarm(controller.room), "Upgrader" + controller.room.name, { role: 'upgrader', full: false, home: controller.room.name });
    }
    return bTree.FAIL;
}

function getBodyPartsUpgraderStatic(room)
{
    var parts = [MOVE, CARRY];    
    const affordableParts = Math.floor((room.energyCapacityAvailable - 100) / 100);
    const maxUseful = room.controller.level == 8 ? 15 : (room.storage.store[RESOURCE_ENERGY] > 150000 ? 20 : (room.storage.store[RESOURCE_ENERGY] < 5000 ? 10 : 15));
    const workParts = Math.min(affordableParts, maxUseful);
    
    for(var i=0; i<workParts; ++i)
        parts.push(WORK);
                
    return parts;
}

function getBodyPartsUpgraderSwarm(room)
{
    const affordableParts = Math.floor(room.energyCapacityAvailable / 200);
    const workParts = Math.min(affordableParts, 4);
    var parts = [];
    
    for(var i=0; i<workParts; ++i)
    {
        parts.push(WORK);
        parts.push(MOVE);
        parts.push(CARRY);
    }
        
    return parts;
}

module.exports = {
    spawn
};