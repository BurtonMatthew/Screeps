let utils = require('utils');
let roomLayout = require('room.layout');
let strategyHarvest = require('strategy.harvest');
let strategyExpansion = require('strategy.expansion');
let strategyUpgrade = require('strategy.upgrade');
let strategyBuild = require('strategy.build');


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

    return parts;
}

var roomExpansion = {
    /** @param {Room} room **/
    run: function(room) 
    {
        const creeps = room.find(FIND_MY_CREEPS);
        const harvesters = _.filter(room.find(FIND_MY_CREEPS), (creep) => creep.memory.role == 'harvester');
        const maintenances = _.filter(room.find(FIND_MY_CREEPS), (creep) => creep.memory.role == 'maintenance');
        const sources = room.find(FIND_SOURCES);
        const conSites = room.find(FIND_CONSTRUCTION_SITES);
        const minerals = room.find(FIND_MINERALS);
        
        if(creeps.length < 4 && harvesters.length < 3)
            utils.getAvailableSpawner(room).createCreep( [WORK, CARRY, MOVE], 'Harvester' + Math.floor(Math.random() * 1000000), { role: 'harvester', full: false, home: room.name });
        else if(utils.spawnStrategyArray(strategyHarvest.spawn, sources)) { }
        else if(utils.spawnStrategyArray(strategyHarvest.spawn, minerals)) { }
        else if(strategyBuild.spawn(room)) {}
        else if(maintenances.length < 2)
            utils.getAvailableSpawner(room).createCreep( getBodyPartsBuilder(room), 'Maintenance' + Math.floor(Math.random() * 1000000), { role: 'maintenance', full: false, home: room.name });
        else if(strategyUpgrade.spawn(room.controller)) {}
        else if(strategyExpansion.spawn(spawners[0])) {}
            
        if("layout" in room.memory)
        {
            if(room.memory.lastApply === undefined || room.memory.lastApply + 2000 < Game.time)
            {
                roomLayout.apply(room, room.memory.layout);
                room.memory.lastApply = Game.time;
            }
            
            try
            {
                if(room.name == "W1N3")
                {
                    //roomLayout.visualize(roomLayout.createLayout(room));
                    //roomLayout.visualize(room.memory.layout);
                    //room.memory.layout = roomLayout.createLayout(room);
                }
            }
            catch(err) { console.log(err); }
        }
        else if(room.name == "W1N3")
        {
            //room.memory.layout = roomLayout.createLayout(room);
        }
            
        const hostiles = room.find(FIND_HOSTILE_CREEPS);
        const towers = room.find(FIND_MY_STRUCTURES, {filter: (structure) => { return structure.structureType == STRUCTURE_TOWER; }});
            
        if(hostiles.length > 0)
        {
            for(var i=0; i<towers.length; ++i)
            {
                var towerTarget = towers[i].pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                    towers[i].attack(towerTarget);
            }
        }
        
        if(room.memory.linkReqEnergy !== undefined)
        {
            const reqLink = Game.getObjectById(room.memory.linkReqEnergy);
            const reqEnergy = reqLink.energyCapacity - reqLink.energy;
            const links = room.find(FIND_MY_STRUCTURES, {filter: (structure) => { return structure.structureType == STRUCTURE_LINK; }});
            for(var i=0, len=links.length; i<len; ++i)
            {
                if(links[i].id != room.memory.linkReqEnergy && links[i].cooldown == 0 && links[i].energy >= reqEnergy)
                {
                    links[i].transferEnergy(reqLink, reqEnergy);
                    room.memory.linkReqEnergy = undefined;
                    break;
                }
            }
        }
    }
}
module.exports = roomExpansion;