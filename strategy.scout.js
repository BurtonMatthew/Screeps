let utils = require('utils');
let bTree = require('behaviourTree');

 /** @param {String} roomName */
function ensureVision(roomName)
{
    return bTree.select
    (
         _.partial(hasVision, roomName)
        ,_.partial(scoutObserver, roomName)
        ,_.partial(scoutCreep, roomName)
    );
}

 /** @param {String} roomName */
function hasVision(roomName)
{
    if(Game.rooms[roomName] !== undefined)
        return bTree.SUCCESS;
    else
        return bTree.FAIL;
}

 /** @param {String} roomName */
function scoutObserver(roomName)
{
    /** @type {StructureObserver[]} */
    const observers = _.filter(Game.structures, (struct) => struct.structureType == STRUCTURE_OBSERVER);
    for(var i=0, len=observers.length; i<len; ++i)
    {
        if(Game.map.getRoomLinearDistance(roomName, observers[i].room.name) <= OBSERVER_RANGE
            && observers[i].observeRoom(roomName) == OK)
        {
            return bTree.INPROGRESS;
        }
    }
    return bTree.FAIL;
}

 /** @param {String} roomName */
function scoutCreep(roomName)
{
    if(Game.creeps["Scout_" + roomName] === undefined)
    {
        if(utils.getCrossmapSpawner(roomName).createCreep([MOVE], "Scout_" + roomName, {role:"scout", home:roomName}) === OK)
            return bTree.INPROGRESS;
        else
            return bTree.FAIL;
    }
    else
        return bTree.INPROGRESS;
}

module.exports = {
    ensureVision
};