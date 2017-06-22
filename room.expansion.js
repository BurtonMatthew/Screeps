var roomLayout = require('room.layout');
var strategyHarvest = require('strategy.harvest');
var strategyExpansion = require('stategy.expansion');

function getBodyPartsUpgrader(room)
{
    // If we don't have a storage we actually have to haul, so use the generic formula
    if(room.storage === undefined)
        return getBodyPartsBuilder(room);
    
    var parts = [MOVE, CARRY];    
    const affordableParts = Math.floor((room.energyCapacityAvailable - 100) / 100);
    const workParts = Math.min(affordableParts, 15);
    
    for(var i=0; i<workParts; ++i)
        parts.push(WORK);
        
    return parts;
}

function getBodyPartsBuilder(room)
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
    
    //if(roomEnergy >= 100)
    //{
    //    parts.push(MOVE);
    //    parts.push(CARRY);
    //}
        
    return parts;
}

var roomExpansion = {
    /** @param {Room} room **/
    run: function(room) 
    {
        const creeps = room.find(FIND_MY_CREEPS);
        const harvesters = _.filter(room.find(FIND_MY_CREEPS), (creep) => creep.memory.role == 'harvester');
        const builders = _.filter(room.find(FIND_MY_CREEPS), (creep) => creep.memory.role == 'builder');
        const maintenances = _.filter(room.find(FIND_MY_CREEPS), (creep) => creep.memory.role == 'maintenance');
        const upgraders = _.filter(room.find(FIND_MY_CREEPS), (creep) => creep.memory.role == 'upgrader');
        const refillers = _.filter(room.find(FIND_MY_CREEPS), (creep) => creep.memory.role == 'refiller');
        const spawners = room.find(FIND_MY_STRUCTURES, {filter: (struct) => struct.structureType == STRUCTURE_SPAWN});
        const sources = room.find(FIND_SOURCES);
        const conSites = room.find(FIND_CONSTRUCTION_SITES);
        
        for(var i=0; i<spawners.length; ++i)
        {
            var anySpawn = false;
            for(var j=0, len=sources.length; j<len && !anySpawn; ++j)
            {
                anySpawn |= strategyHarvest.spawn(spawners[i], sources[j]);
            }
            
            
            if(creeps.length < 4 && harvesters.length < 3)
                spawners[i].createCreep( [WORK, CARRY, MOVE], 'Harvester' + Math.floor(Math.random() * 1000000), { role: 'harvester', full: false, home: room.name });
            else if(anySpawn) { }
            else if(builders.length < 3 && conSites.length > 0)
                spawners[i].createCreep( getBodyPartsBuilder(room), 'Builder' + Math.floor(Math.random() * 1000000), { role: 'builder', full: false, home: room.name });
            else if(maintenances.length < 2)
                spawners[i].createCreep( getBodyPartsBuilder(room), 'Maintenance' + Math.floor(Math.random() * 1000000), { role: 'maintenance', full: false, home: room.name });
            else if(upgraders.length < 1 + (room.storage === undefined ? 4 : 0))
                spawners[i].createCreep( getBodyPartsUpgrader(room), 'Upgrader' + Math.floor(Math.random() * 1000000), { role: 'upgrader', full: false, home: room.name });
            else if(strategyExpansion.spawn(spawners[i])) {}
            //else if(refillers.length < 4)
            //    spawners[i].createCreep( [MOVE,MOVE,CARRY,CARRY], "Refiller" + Math.floor(Math.random() * 1000000), { role: 'refiller' });
            //else
            //    spawners[i].createCreep( [TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,MOVE, ATTACK, ATTACK, ATTACK, TOUGH, TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK], 'Fighter' + Math.floor(Math.random() * 1000000), { role: 'fighter' });

            //else
            //{
            //    spawners[i].createCreep( [MOVE], "Harass" + Math.floor(Math.random() * 1000000), { role: 'harasser' });
            //}
            
        }
        
        
            
        if("layout" in room.memory)
        {
            if(room.roomName == "W1N3")
                console.log("in here2");
            
            if(room.memory.lastApply === undefined || room.memory.lastApply + 2000 < Game.time)
            {
                roomLayout.apply(room, room.memory.layout);
                room.memory.lastApply = Game.time;
            }
            
            try
            {
                //roomLayout.visualize(room.memory.layout);
                //room.memory.layout = roomLayout.createLayout(room);
                //roomLayout.visualize(roomLayout.createLayout(room));
            }
            catch(err) { console.log(err); }
        }
        else if(room.name == "W1N3")
        {
            //console.log("in here");
            //room.memory.layout = roomLayout.createLayout(room);
        }
            
        const hostiles = room.find(FIND_HOSTILE_CREEPS);
        const towers = room.find(FIND_MY_STRUCTURES, {filter: (structure) => { return structure.structureType == STRUCTURE_TOWER; }});
            
        if(hostiles.length > 0)
        {
            for(var i=0; i<towers.length; ++i)
            {
                var towerTarget = towers[i].pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                if(i==1)
                    towers[i].attack(Game.getObjectById("8b096aaa106be09"));
                else
                    towers[i].attack(towerTarget);
            }
        }
        
        if(room.memory.linkReqEnergy !== undefined)
        {
            const links = room.find(FIND_MY_STRUCTURES, {filter: (structure) => { return structure.structureType == STRUCTURE_LINK; }});
            for(var i=0, len=links.length; i<len; ++i)
            {
                if(links[i].id != room.memory.linkReqEnergy && links[i].cooldown == 0 && links[i].energy == links[i].energyCapacity)
                {
                    links[i].transferEnergy(Game.getObjectById(room.memory.linkReqEnergy));
                    room.memory.linkReqEnergy = undefined;
                    break;
                }
            }
        }
    }
}
module.exports = roomExpansion;