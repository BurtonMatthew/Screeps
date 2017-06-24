var utils = require('utils');
function spawn(controller)
{
    if(controller === undefined || !controller.my)
        return false;
        
    if(controller.room.storage !== undefined && controller.pos.inRangeTo(controller.room.storage, 3))
    {
        utils.getClosestSpawner(controller.pos).createCreep(getBodyPartsUpgraderStatic(controller.room), "Upgrader" + controller.room.name
            , { role: 'upgrader', full: false, home: controller.room.name });
        return true;
    }
    else if(controller.level >= 6) // Super hacky way to see if we're a link based controller, only applies to starting room
    {
        const link = controller.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: (struct) => struct.structureType == STRUCTURE_LINK});
        utils.getClosestSpawner(controller.pos).createCreep(getBodyPartsUpgraderStatic(controller.room), "Upgrader" + controller.room.name
            , { role: 'upgrader', full: false, home: controller.room.name, linkId: link.id});
        return true;
    }
    // No good tech, upgrader swarm!
    else
    {
        return utils.spawnToCount(_.partial(utils.getAvailableSpawner, room), 4,
                getBodyPartsUpgraderSwarm(controller.room), "Upgrader" + controller.room.name, { role: 'upgrader', full: false, home: controller.room.name });
    }
    return false;
}

function getBodyPartsUpgraderStatic(room)
{
    var parts = [MOVE, CARRY];    
    const affordableParts = Math.floor((room.energyCapacityAvailable - 100) / 100);
    const workParts = Math.min(affordableParts, 15);
    
    for(var i=0; i<workParts; ++i)
        parts.push(WORK);
        
    return parts;
}

function getBodyPartsUpgraderSwarm(room)
{
    var roomEnergy = room.energyCapacityAvailable;
    var workParts = 0;
    var parts = [];
    while(workParts < 2 && roomEnergy >= 200)
    {
        roomEnergy -= 200
        workParts++;
        parts.push(WORK);
        parts.push(MOVE);
        parts.push(CARRY);
    }
        
    return parts;
}

module.exports = {
    spawn
};