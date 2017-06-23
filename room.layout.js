function visualize(layout)
{
    visualizePosSquare(layout.storage, "#00ff00");
    visualizeArrayCircles(layout.containers, "#00ff00");
    visualizeArrayCircles(layout.links, "#0000ff");
    visualizeArrayCircles(layout.roads, "#000000");
    visualizeArraySquares(layout.walls, "#ff0000");
    visualizeArrayCircles(layout.ramparts, "#ffffff");
    visualizeArraySquares(layout.spawns, "#ffff00");
    visualizeArrayCircles(layout.mines, "#00ffff");
    visualizeArrayCircles(layout.extensions, "#ff00ff");
    visualizeArraySquares(layout.towers, "#ff00ff");
}

function apply(room, layout)
{
    room.createConstructionSite(new RoomPosition(layout.storage.x, layout.storage.y, layout.storage.roomName), STRUCTURE_STORAGE);
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

function applyArray(room, arr, type)
{
    for(var i=0, len=arr.length; i<len; ++i)
    {
        const pos = new RoomPosition(arr[i].x, arr[i].y, arr[i].roomName);
        room.createConstructionSite(pos, type);
    }
}

function visualizePosSquare(pos, colour)
{
    new RoomVisual(pos.roomName).rect(pos.x - 0.25, pos.y - 0.25, 0.5, 0.5, {fill: colour, stroke: "#000000"});
}

function visualizeArrayCircles(arr, colour)
{
    for(var i=0, len=arr.length; i<len; ++i)
    {
        new RoomVisual(arr[i].roomName).circle(arr[i], { radius: .25, fill: colour});
    }
}

function visualizeArraySquares(arr, colour)
{
    for(var i=0, len=arr.length; i<len; ++i)
    {
        new RoomVisual(arr[i].roomName).rect(arr[i].x - 0.25, arr[i].y - 0.25, 0.5, 0.5, {fill: colour, stroke: "#000000"});
    }
}

function createLayout(room)
{
    var layout = {};
    var usedPositions = [];
    //room.lookAtArea(0, 0, 49, 49);
    
    // Storage
    const conAdj = findEmptyAdj(room, room.controller.pos.x, room.controller.pos.y, usedPositions);
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
        const newPos = findEmptyAdjNearController(room, sources[i].pos.x, sources[i].pos.y, usedPositions);
        usedPositions.push(newPos)
        sourceContainers.push(newPos);
    }
    
    var mineContainers = [];
    for(var i=0, len=layout.mines.length; i<len; ++i)
    {
        const newPos = findEmptyAdjNearController(room, layout.mines[i].x, layout.mines[i].y, usedPositions);
        usedPositions.push(newPos)
        mineContainers.push(newPos);
    }
    
    layout.containers = sourceContainers.concat(mineContainers);
    
    // Roads - build a destination list
    var destinations = [];
    // To exits
    const exits = Game.map.describeExits(room.name);
    for(exit in exits)
    {
        destinations.push(layout.storage.findClosestByPath(parseInt(exit)));
    }
    // To sources
    for(var i=0, len=layout.containers.length; i<len; ++i)
    {
        destinations.push(layout.containers[i]);
    }
    var roadTiles = [];
    for(var i=0, len=destinations.length; i<len; ++i)
    {
        const path = layout.storage.findPathTo(destinations[i], {ignoreCreeps: 1/*, avoid: usedPositions*/});
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
    
    // Storage Link
    layout.links = [];
    const storLink = findEmptyAdjFarController(room, layout.storage.x, layout.storage.y, usedPositions);
    layout.links.push(storLink);
    usedPositions.push(storLink);
    
    layout.spawns = [];
    const spawn = findEmptyAdjFarController(room, layout.links[0].x, layout.links[0].y, usedPositions);
    layout.spawns.push(spawn);
    usedPositions.push(spawn);
    
    // Walls
    layout.walls = [];
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
        emptAdjAdj = _.filter(emptAdjAdj, function(n) { return !_.any(exitPoints, n);});
        emptAdjAdj = _.filter(emptAdjAdj, function(n) { return !_.any(emptAdj, n);});
        layout.walls = layout.walls.concat(emptAdjAdj);
    }
    layout.walls = _.uniq(layout.walls);
    layout.ramparts = _.filter(layout.walls, function(n) { return _.any(usedPositions, n);});
    layout.walls = _.filter(layout.walls, function(n) { return !_.any(usedPositions, n);});
    usedPositions.concat(layout.walls);
    
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
    while(acceptedSites.length < 66 && i<sitesToExamine.length)
    {
        const ePos = sitesToExamine[i];
        if(room.lookForAt(LOOK_TERRAIN, ePos) != "wall")
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
    
    layout.roads = _.uniq(layout.roads);
    
    
    return layout;
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

module.exports = {
    visualize,
    createLayout,
    apply
};