function visualize(room, layout)
{
    visualizePosSquare(room, layout.storage, "#00ff00");
    visualizePosSquare(room, layout.terminal, "#ffffff");
    visualizeArrayCircles(room, layout.containers, "#00ff00");
    visualizeArrayCircles(room, layout.links, "#0000ff");
    visualizeArrayCircles(room, layout.roads, "#000000");
    visualizeArraySquares(room, layout.walls, "#ff0000");
    visualizeArrayCircles(room, layout.ramparts, "#ffffff");
    visualizeArraySquares(room, layout.spawns, "#ffff00");
    visualizeArrayCircles(room, layout.mines, "#00ffff");
    visualizeArrayCircles(room, layout.extensions, "#ff00ff");
    visualizeArraySquares(room, layout.towers, "#ff00ff");
}

function apply(room, layout)
{
    if(layout.storage)
        room.createConstructionSite(new RoomPosition(layout.storage.x, layout.storage.y, room.name), STRUCTURE_STORAGE);
    //if(layout.terminal)
    //    room.createConstructionSite(new RoomPosition(layout.terminal.x, layout.terminal.y, room.name), STRUCTURE_TERMINAL);
    applyArray(room, layout.spawns, STRUCTURE_SPAWN);
    applyArray(room, layout.extensions, STRUCTURE_EXTENSION);
    applyArray(room, layout.containers, STRUCTURE_CONTAINER);
    applyArray(room, layout.containers, STRUCTURE_ROAD);
    applyArray(room, layout.links, STRUCTURE_LINK);
    applyArray(room, layout.roads, STRUCTURE_ROAD);
    applyArray(room, layout.walls, STRUCTURE_WALL);
    applyArray(room, layout.ramparts, STRUCTURE_RAMPART);
    applyArray(room, layout.mines, STRUCTURE_EXTRACTOR);
    applyArray(room, layout.towers, STRUCTURE_TOWER);
}

function flattenLayout(layout)
{
    layout.spawns = flattenArray(layout.spawns);
    layout.extensions = flattenArray(layout.extensions);
    layout.containers = flattenArray(layout.containers);
    layout.links = flattenArray(layout.links);
    layout.roads = flattenArray(layout.roads);
    layout.walls = flattenArray(layout.walls);
    layout.ramparts = flattenArray(layout.ramparts);
    layout.mines = flattenArray(layout.mines);
    layout.towers = flattenArray(layout.towers);
    return layout;
}

function flattenArray(arr)
{
    var newObj = {};

    if(arr !== undefined)
    {
        newObj.count = arr.length;
        newObj.x = new Array(arr.length);
        newObj.y = new Array(arr.length);

        for(var i=0; i<newObj.count; ++i)
        {
            newObj.x[i] = arr[i].x;
            newObj.y[i] = arr[i].y;
        }
    }

    return newObj;
}

/** @param {Room} room */
function memorize(room)
{
    var layout = {};
    
    const spawns = room.find(FIND_MY_STRUCTURES, {filter: (struct) => struct.structureType == STRUCTURE_SPAWN });
    layout.spawns = flattenArray(_.map(spawns, (spawns) => spawns.pos));

    const extensions = room.find(FIND_MY_STRUCTURES, {filter: (struct) => struct.structureType == STRUCTURE_EXTENSION });
    layout.extensions = flattenArray(_.map(extensions, (ext) => ext.pos));

    const containers = room.find(FIND_STRUCTURES, {filter: (struct) => struct.structureType == STRUCTURE_CONTAINER });
    layout.containers = flattenArray(_.map(containers, (container) => container.pos));

    const links = room.find(FIND_MY_STRUCTURES, {filter: (struct) => struct.structureType == STRUCTURE_LINK });
    layout.links = flattenArray(_.map(links, (link) => link.pos));

    const roads = room.find(FIND_STRUCTURES, {filter: (struct) => struct.structureType == STRUCTURE_ROAD });
    layout.roads = flattenArray(_.map(roads, (road) => road.pos));

    const walls = room.find(FIND_STRUCTURES, {filter: (struct) => struct.structureType == STRUCTURE_WALL });
    layout.walls = flattenArray(_.map(walls, (wall) => wall.pos));

    const ramparts = room.find(FIND_MY_STRUCTURES, {filter: (struct) => struct.structureType == STRUCTURE_RAMPART });
    layout.ramparts = flattenArray(_.map(ramparts, (rampart) => rampart.pos));

    const mines = room.find(FIND_STRUCTURES, {filter: (struct) => struct.structureType == STRUCTURE_EXTRACTOR });
    layout.mines = flattenArray(_.map(mines, (mine) => mine.pos));

    const towers = room.find(FIND_MY_STRUCTURES, {filter: (struct) => struct.structureType == STRUCTURE_TOWER });
    layout.towers = flattenArray(_.map(towers, (tower) => tower.pos));

    if(room.storage)
        layout.storage = { x:room.storage.x, y:room.storage.y };
    if(room.terminal)
        layout.terminal = { x:room.terminal.x, y:room.terminal.y };

    return layout;
}

function applyArray(room, arr, type)
{
    if(arr === undefined)
        return;

    for(var i=0, len=arr.count; i<len; ++i)
    {
        const pos = new RoomPosition(arr.x[i], arr.y[i], room.name);
        room.createConstructionSite(pos, type);
    }
}

function visualizePosSquare(room, pos, colour)
{
    if(pos === undefined)
        return;

    new RoomVisual(room.name).rect(pos.x - 0.25, pos.y - 0.25, 0.5, 0.5, {fill: colour, stroke: "#000000"});
}

function visualizeArrayCircles(room, arr, colour)
{
    if(arr === undefined)
        return;

    for(var i=0, len=arr.count; i<len; ++i)
    {
        new RoomVisual(room.name).circle(arr.x[i], arr.y[i], { radius: .25, fill: colour});
    }
}

function visualizeArraySquares(room, arr, colour)
{
    if(arr === undefined)
        return;

    for(var i=0, len=arr.count; i<len; ++i)
    {
        new RoomVisual(room.name).rect(arr.x[i] - 0.25, arr.y[i] - 0.25, 0.5, 0.5, {fill: colour, stroke: "#000000"});
    }
}

/** @param {Room} room */
function createBaseLayout(room)
{
    var layout = {};
    var usedPositions = [];
    
    // Cant build next to exits
    var exitPts = [];
    var exitAdj = [];
    var exitAdjAdj = [];
    const exits = Game.map.describeExits(room.name);
    for(exit in exits)
    {
        const exitPoints = room.find(parseInt(exit));
        var emptAdj = [];
        for(var i=0, len = exitPoints.length; i<len; ++i)
        {
            emptAdj = emptAdj.concat(findAllEmptyAdj(room, exitPoints[i].x, exitPoints[i].y, usedPositions));
        }
        var emptAdjAdj = [];
        for(var i=0, len = emptAdj.length; i<len; ++i)
        {
            emptAdjAdj = emptAdjAdj.concat(findAllEmptyAdj(room, emptAdj[i].x, emptAdj[i].y, usedPositions));
        }
        exitPts = exitPts.concat(exitPoints);
        exitAdj = exitAdj.concat(emptAdj);
        exitAdjAdj = exitAdjAdj.concat(emptAdjAdj);
    }
    exitAdj = uniqueArray(exitAdj);
    exitAdjAdj = uniqueArray(exitAdjAdj);
    
    var costMatrix = new PathFinder.CostMatrix;
    for(var i=0; i<50; ++i)
    {
        for(var j=0; j<50; ++j)
        {
            if(room.lookForAt(LOOK_TERRAIN, i, j) == "wall")
                costMatrix.set(i,j,255);
            else
                costMatrix.set(i,j,1);
        }
    }
    
    for(var i=0, len=exitAdjAdj.length; i<len; ++i)
    {
        costMatrix.set(exitAdjAdj[i].x, exitAdjAdj[i].y, 50);
    }
    
    // Storage
    const conAdj = findEmptyAdj(room, room.controller.pos.x, room.controller.pos.y, usedPositions.concat(exitAdjAdj));
    const storPos = findEmptyAdjMaxSpace(room, conAdj.x, conAdj.y, usedPositions);
    layout.storage = storPos;
    usedPositions.push(storPos);
    
    // Mines
    layout.mines = [];
    const minerals = room.find(FIND_MINERALS);
    for(var i=0, len=minerals.length; i<len; ++i)
    {
        layout.mines.push(minerals[i].pos);
        usedPositions.push(minerals[i].pos)
    }
    
    // Containers
    const sources = room.find(FIND_SOURCES);
    var sourceContainers = [];
    for(var i=0, len=sources.length; i<len; ++i)
    {
        const newPos = findEmptyAdjNearController(room, sources[i].pos.x, sources[i].pos.y, usedPositions.concat(exitAdjAdj));
        usedPositions.push(newPos)
        sourceContainers.push(newPos);
    }
    
    var mineContainers = [];
    for(var i=0, len=layout.mines.length; i<len; ++i)
    {
        const newPos = findEmptyAdjNearController(room, layout.mines[i].x, layout.mines[i].y, usedPositions.concat(exitAdjAdj));
        usedPositions.push(newPos)
        mineContainers.push(newPos);
    }
    layout.containers = sourceContainers.concat(mineContainers);
    
    // Roads - build a destination list
    var destinations = [];
    // To sources
    for(var i=0, len=layout.containers.length; i<len; ++i)
    {
        destinations.push(layout.containers[i]);
    }
    // To exits
    for(exit in exits)
    {
        destinations.push(layout.storage.findClosestByPath(parseInt(exit)));
    }
    var roadTiles = [];
    for(var i=0, len=destinations.length; i<len; ++i)
    {
        const path = layout.storage.findPathTo(destinations[i], {ignoreCreeps: 1, costCallback: (string, matrix) => costMatrix});
        for(var j=0, pathLen=path.length; j<pathLen; ++j)
        {
            const roadPos = new RoomPosition(path[j].x, path[j].y, room.name);
            if(! _.any(roadTiles,roadPos)) 
                roadTiles.push(roadPos);
        }
    }
    layout.roads = [];
    for(var i=0, len=roadTiles.length; i<len; ++i)
    {
        layout.roads.push(roadTiles[i]);
        usedPositions.push(roadTiles[i]);
    }
    
    // Walls
    layout.walls = exitAdjAdj;
    layout.walls = _.filter(exitAdjAdj, function(n) { return !_.any(exitPts, n);});
    layout.walls = _.filter(exitAdjAdj, function(n) { return !_.any(exitAdj, n);});
    layout.ramparts = _.filter(layout.walls, function(n) { return _.any(usedPositions, n);});
    layout.walls = _.filter(layout.walls, function(n) { return !_.any(usedPositions, n);});
    
    usedPositions = usedPositions.concat(exitAdjAdj);
    
    // Storage Link
    layout.links = [];
    const storLink = findEmptyAdjFarController(room, layout.storage.x, layout.storage.y, usedPositions);
    layout.links.push(storLink);
    usedPositions.push(storLink);
    
    layout.spawns = [];
    const spawn = findEmptyAdjFarController(room, layout.links[0].x, layout.links[0].y, usedPositions);
    layout.spawns.push(spawn);
    usedPositions.push(spawn);
    
    // SourceLinks
    for(var i=0, len=sourceContainers.length; i<len; ++i)
    {
        var newPos = findEmptyAdjFarController(room, sourceContainers[i].x, sourceContainers[i].y, usedPositions);
        usedPositions.push(newPos)
        layout.links.push(newPos);
    }
    
    // ExtensionSites
    var sitesToExamine = [layout.storage];
    var acceptedSites = [];
    var i = 0;
    while(acceptedSites.length < 67 && i<sitesToExamine.length)
    {
        const ePos = sitesToExamine[i];
        if(room.lookForAt(LOOK_TERRAIN, ePos) != "wall" && !_.any(exitAdjAdj, ePos))
        {
            // Add diag to examinable sites
            const upleft = new RoomPosition(ePos.x-1, ePos.y-1, ePos.roomName);
            const upright = new RoomPosition(ePos.x+1, ePos.y-1, ePos.roomName);
            const downleft = new RoomPosition(ePos.x-1, ePos.y+1, ePos.roomName);
            const downright = new RoomPosition(ePos.x+1, ePos.y+1, ePos.roomName);
            if(!_.any(sitesToExamine, upleft))
                sitesToExamine.push(upleft);
            if(!_.any(sitesToExamine, upright))
                sitesToExamine.push(upright);
            if(!_.any(sitesToExamine, downleft))
                sitesToExamine.push(downleft);
            if(!_.any(sitesToExamine, downright))
                sitesToExamine.push(downright);
                
            // Check for validity
            if(!_.any(usedPositions, ePos))
            {
                const left = new RoomPosition(ePos.x-1, ePos.y, ePos.roomName);
                const right = new RoomPosition(ePos.x+1, ePos.y, ePos.roomName);
                const up = new RoomPosition(ePos.x, ePos.y-1, ePos.roomName);
                const down = new RoomPosition(ePos.x, ePos.y+1, ePos.roomName);
                
                if(    (!_.any(usedPositions, left) || _.any(layout.roads, left))
                    && (!_.any(usedPositions, right) || _.any(layout.roads, right))
                    && (!_.any(usedPositions, up) || _.any(layout.roads, up))
                    && (!_.any(usedPositions, down) || _.any(layout.roads, down)))
                {
                    acceptedSites.push(ePos);
                    usedPositions.push(ePos);
                    if(room.lookForAt(LOOK_TERRAIN, left) != "wall" && !_.any(usedPositions, left))
                    {
                        layout.roads.push(left);
                        usedPositions.push(left);
                    }
                    if(room.lookForAt(LOOK_TERRAIN, right) != "wall" && !_.any(usedPositions, right))
                    {
                        layout.roads.push(right);
                        usedPositions.push(right);
                    }
                    if(room.lookForAt(LOOK_TERRAIN, up) != "wall" && !_.any(usedPositions, up))
                    {
                        layout.roads.push(up);
                        usedPositions.push(up);
                    }
                    if(room.lookForAt(LOOK_TERRAIN, down) != "wall" && !_.any(usedPositions, down))
                    {
                        layout.roads.push(down);
                        usedPositions.push(down);
                    }
                }
            }
        }
        ++i;
    }
    
    layout.extensions = acceptedSites.slice(0,60);
    layout.towers = acceptedSites.slice(60,66);
    layout.terminal = { x:acceptedSites[66].x, y:acceptedSites[66].y };
    
    layout.roads = uniqueArray(layout.roads);
    
    
    return flattenLayout(layout);
}

/** @param {Room} sourceRoom */
/** @param {Room} destRoom */
function createRemoteHarvestLayout(sourceRoom, destRoom)
{
    var layout = {};
    layout.roads = [];
    layout.containers = [];

    const sources = destRoom.find(FIND_SOURCES);
    for(var i=0, len = sources.length; i<len; ++i)
    {
        var startPos;
        //if(findEmptyAdj(sourceRoom, sourceRoom.controller.pos.x, sourceRoom.controller.pos.y, []) !== null)
        //    startPos = sourceRoom.controller.pos;
        //else
            startPos = sourceRoom.find(FIND_MY_STRUCTURES, {filter: (struct) => struct.structureType === STRUCTURE_SPAWN})[0].pos;
            //console.log("hi");

        const pathInfo = PathFinder.search(startPos, {pos: sources[i].pos, range:1},
        {
            plainCost: 3,
            swampCost: 3,
            maxCost: Infinity,
            maxOps: 20000,
            roomCallback: function(roomName)
            {
                let room = Game.rooms[roomName];
                if (!room) return;
                let costs = new PathFinder.CostMatrix;
                room.find(FIND_STRUCTURES).forEach(
                    function(struct) 
                    {
                        if (struct.structureType === STRUCTURE_ROAD) 
                        {
                            // Favor roads over plain tiles
                            if(roomName == sourceRoom.name)
                                costs.set(struct.pos.x, struct.pos.y, 0);
                            else
                                costs.set(struct.pos.x, struct.pos.y, 1);
                        } 
                        else if (struct.structureType !== STRUCTURE_CONTAINER &&
                                (struct.structureType !== STRUCTURE_RAMPART || !struct.my)) 
                        {
                            // Can't walk through non-walkable buildings
                            costs.set(struct.pos.x, struct.pos.y, 0xff);
                        }
                    });

                if(roomName === destRoom.name)
                    layout.roads.forEach((pos) => costs.set(pos.x, pos.y, 1));
            
                return costs;
            }
        });

        layout.roads = layout.roads.concat(_.filter(pathInfo.path, (pos) => pos.roomName === destRoom.name));
        if(pathInfo.path.length > 0)
            layout.containers.push(_.last(pathInfo.path));
    }

    layout.roads = uniqueArray(layout.roads);

    return flattenLayout(layout);
}

function findEmptyAdj(room, x, y, used)
{
    const tiles = room.lookForAtArea(LOOK_TERRAIN, y-1, x-1, y+1, x+1, true);
    for(var i=0, len=tiles.length; i<len; ++i)
    {
        if(tiles[i].terrain != 'wall')
        {
            const startPos = new RoomPosition(tiles[i].x, tiles[i].y, room.name);
            return startPos;
        }
    }

    return null;
}

function findAllEmptyAdj(room, x, y, used)
{
    return _.map(
                    _.filter(room.lookForAtArea(LOOK_TERRAIN, y-1, x-1, y+1, x+1, true), (terr) => terr.terrain != "wall"),
                    _.partial((room, terr) => new RoomPosition(terr.x, terr.y, room.name), room));
}

function findEmptyAdjNearController(room, x, y, used)
{
    const tiles = room.lookForAtArea(LOOK_TERRAIN, y-1, x-1, y+1, x+1, true);
    var bestTile;
    var bestTileCost = Infinity;
    for(var i=0, len=tiles.length; i<len; ++i)
    {
        if(tiles[i].terrain != 'wall')
        {
            const startPos = new RoomPosition(tiles[i].x, tiles[i].y, room.name);
            if(_.any(used, startPos))
                continue;

            const path = room.findPath(startPos, room.controller.pos, {ignoreCreeps: 1});
            if(path.length < bestTileCost)
            {
                bestTile = startPos;
                bestTileCost = path.length;
            }
        }
    }
    
    return bestTile;
}

function findEmptyAdjFarController(room, x, y, used)
{
    const tiles = room.lookForAtArea(LOOK_TERRAIN, y-1, x-1, y+1, x+1, true);
    var bestTile;
    var bestTileCost = 0;
    for(var i=0, len=tiles.length; i<len; ++i)
    {
        if(tiles[i].terrain != 'wall')
        {
            const startPos = new RoomPosition(tiles[i].x, tiles[i].y, room.name);
            if(_.any(used, startPos))
                continue;

            const path = room.findPath(startPos, room.controller.pos, {ignoreCreeps: 1});
            if(path.length > bestTileCost)
            {
                bestTile = startPos;
                bestTileCost = path.length;
            }
        }
    }
    return bestTile;
}

function findEmptyAdjMaxSpace(room, x, y, used)
{
    const tiles = room.lookForAtArea(LOOK_TERRAIN, y-1, x-1, y+1, x+1, true);
    var bestTile;
    var bestTileCost = 0;
    for(var i=0, len=tiles.length; i<len; ++i)
    {
        if(tiles[i].terrain != 'wall')
        {
            const startPos = new RoomPosition(tiles[i].x, tiles[i].y, room.name);
            if(_.any(used, startPos))
                continue;

            const nearTiles = room.lookForAtArea(LOOK_TERRAIN, tiles[i].y-1, tiles[i].x-1, tiles[i].y+1, tiles[i].x+1, true);
            if(_.filter(nearTiles, function(tile) { return tile.terrain != 'wall'; }).length > bestTileCost)
            {
                bestTile = startPos;
                bestTileCost = _.filter(nearTiles, function(tile) { return tile.terrain != 'wall'; }).length;
            }
        }
    }
    return bestTile;
}

function uniqueArray(arr)
{
    var ret = [];
    for(var i=0, len=arr.length; i<len; ++i)
    {
        if(!_.any(ret, arr[i]))
            ret.push(arr[i]);
    }
    return ret;
}
module.exports = {
    visualize,
    memorize,
    createBaseLayout,
    createRemoteHarvestLayout,
    apply
};