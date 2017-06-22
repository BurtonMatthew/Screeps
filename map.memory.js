function memorize(room)
{
    if(Memory.mapInfo !== undefined)
    {
        var mapInfo = {};
        mapInfo.unexploredRooms = [];
        Memory.mapInfo = mapInfo;
        return;
    }
    
    var memorizedRoomInfo = {};
    const sources = room.find(FIND_SOURCES);
    const hostile = room.find(FIND_HOSTILE_STRUCTURES);
    const minerals = room.find(FIND_MINERALS);

    memorizedRoomInfo.isHostile = hostile.length > 0;
    
    sourcePos = [];
    for(var i=0; i<sources.length; ++i)
    {
        var source = {};
        source.pos = sources[i].pos;
        sourcePos.push(source);
    }
    memorizedRoomInfo.sources = sourcePos;
    
    mineralData = [];
    for(var i=0; i<minerals.length; ++i)
    {
        var mineral = {};
        mineral.pos = minerals[i].pos;
        mineral.density = minerals[i].density;
        mineral.mineralType = minerals[i].mineralType;
        mineralData.push(mineral);
    }
    memorizedRoomInfo.minerals = mineralData;
    
    if(room.controller === undefined)
    {
        memorizedRoomInfo.hasController = false;
    }
    else
    {
        memorizedRoomInfo.hasController = true;
        memorizedRoomInfo.controller = {};
        memorizedRoomInfo.controller.pos = room.controller.pos;
        memorizedRoomInfo.controller.owner = room.controller.owner;
        memorizedRoomInfo.controller.my = room.controller.my;
        memorizedRoomInfo.controller.level = room.controller.level;
    }
    
    var exits = Game.map.describeExits(room.name);
    for(var i in exits)
    {
        if(!(exits[i] in Memory.mapInfo || Memory.mapInfo.unexploredRooms.indexOf(exits[i]) !== -1))
        {
            Memory.mapInfo.unexploredRooms.push(exits[i]);
        }
    }
    
    if(Memory.mapInfo.unexploredRooms.indexOf(room.name) !== -1)
    {
        Memory.mapInfo.unexploredRooms.splice(Memory.mapInfo.unexploredRooms.indexOf(room.name), 1);
    }
    
    memorizedRoomInfo.exploredTime = Game.time;
    Memory.mapInfo[room.name] = memorizedRoomInfo;
}

function getStaleRoom()
{
    if(Memory.mapInfo.unexploredRooms.length > 0)
        return Memory.mapInfo.unexploredRooms[0];
    else
    {
        var staleRoom = "";
        var staleTime = Infinity;
        for(roomName in Memory.mapInfo)
        {
            if(roomName == "unexploredRooms" || roomName == "W5N5")
                continue;
                
            if(!Memory.mapInfo[roomName].isHostile && Memory.mapInfo[roomName].exploredTime < staleTime)
            {
                staleTime = Memory.mapInfo[roomName].exploredTime;
                staleRoom = roomName;
            }
        }
        return staleRoom;
    }
}

function isHostile(roomName)
{
    return roomName in Memory.mapInfo && Memory.mapInfo[roomName].isHostile;
}

module.exports = {
    memorize,
    getStaleRoom,
    isHostile
};