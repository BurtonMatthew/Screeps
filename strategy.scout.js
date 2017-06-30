let bTree = require('behaviourTree');

function ensureVision(roomName)
{
    return bTree.select
    (
         _.partial(hasVision, roomName)
        ,_.partial(scoutObserver, roomName)
        ,_.partial(scoutCreep, roomName)
    );
}

function hasVision(roomName)
{
    if(Game.rooms[roomName] !== undefined)
        return bTree.SUCCESS;
    else
        return bTree.FAIL;
}

function scoutObserver(roomName)
{
    /** @type {StructureObserver[]} */
    const observers = _.filter(Game.structures, (struct) => struct.structureType == STRUCTURE_OBSERVER);
    for(var i=0, len=observers.length; i<len; ++i)
    {
        if(Game.map.getRoomLinearDistance(roomName, observers[i].room.name) <= OBSERVER_RANGE
            && observers[i].observeRoom(roomName) == OK)
            return bTree.INPROGRESS;
    }
    return bTree.FAIL;
}

function scoutCreep(roomName)
{
    return bTree.FAIL;
}

module.exports = {
    ensureVision
};