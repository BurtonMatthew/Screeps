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
            return bTree.INPROGRESS;
        }

        if(controller.level < 8 
            && controller.room.storage 
            && controller.room.storage.store[RESOURCE_ENERGY] > 200000 
            && Game.creeps["Upgrader2" + controller.room.name] === undefined)
        {
            utils.getClosestSpawner(controller.pos).createCreep(getBodyPartsUpgraderStatic(controller.room), "Upgrader2" + controller.room.name
                , { role: 'upgrader', full: false, home: controller.room.name });
            return bTree.INPROGRESS;
        }
    }
    // No good tech, upgrader swarm!
    else
    {
        if(utils.spawnToCount(_.partial(utils.getAvailableSpawner, controller.room), 4,
                getBodyPartsUpgraderSwarm(controller.room), "Upgrader" + controller.room.name, { role: 'upgrader', full: false, home: controller.room.name }))
            return bTree.INPROGRESS;
    }
    return bTree.SUCCESS;
}

function getBodyPartsUpgraderStatic(room)
{
    var parts = [MOVE, CARRY];    
    const affordableParts = Math.floor((room.energyCapacityAvailable - 100) / 100);
    const maxUseful = Math.min(48, room.controller.level == 8 ? 15 : (10 + (Math.max(0, room.storage.store[RESOURCE_ENERGY] - 1500) / 5000)));
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