let utils = require('utils');
let strategyExpansion = require('strategy.expansion');
let strategyHarvest = require('strategy.harvest');
let strategyUpgrade = require('strategy.upgrade');

var roomBase = {
    /** @param {Room} room **/
    run: function(room) 
    {
        const hostiles = room.find(FIND_HOSTILE_CREEPS);
        const builders = _.filter(room.find(FIND_MY_CREEPS), (creep) => creep.memory.role == 'builder');
        const maintenances = _.filter(room.find(FIND_MY_CREEPS), (creep) => creep.memory.role == 'maintenance');
        const upgraders = _.filter(room.find(FIND_MY_CREEPS), (creep) => creep.memory.role == 'upgrader');
        const explorers = _.filter(Game.creeps, (creep) => creep.memory.role == 'explorer');
        const linkupgraders = _.filter(room.find(FIND_MY_CREEPS), (creep) => creep.memory.role == 'linkupgrader');
        const refillers = _.filter(room.find(FIND_MY_CREEPS), (creep) => creep.memory.role == 'refiller');
        const conSites = room.find(FIND_CONSTRUCTION_SITES);
        const repairSites = room.find(FIND_STRUCTURES, { filter: (structure) => { return structure.hits < structure.hitsMax *.8; }});
        const towers = room.find(FIND_MY_STRUCTURES, {filter: (structure) => { return structure.structureType == STRUCTURE_TOWER; }});
        const sources = room.find(FIND_SOURCES);
        const minerals = room.find(FIND_MINERALS);
        const creeps = room.find(FIND_MY_CREEPS);
        
        if(creeps.length < 4) // Emergency no harvester case
        {
            utils.getAvailableSpawner(room).createCreep( [WORK, CARRY, MOVE], 'Harvester' + Math.floor(Math.random() * 1000000), { role: 'harvester', full: false });
        }
        else if(utils.spawnStrategyArray(strategyHarvest.spawn, sources)) { }
        else if(utils.spawnStrategyArray(strategyHarvest.spawn, minerals)) { }
        else if(explorers.length < 1)
        {
            utils.getAvailableSpawner(room).createCreep( [MOVE], 'Explorer' + Math.floor(Math.random() * 1000000), { role: 'explorer' });
        }
        else if(false && conSites.length > 0 && builders.length < 3)
        {
            utils.getAvailableSpawner(room).createCreep( [WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE], 'Builder' + Math.floor(Math.random() * 1000000), { role: 'builder', home: "W3N4" });
        }
        else if(repairSites.length > 0 && maintenances.length < 2)
        {
            utils.getAvailableSpawner(room).createCreep( [WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE], 'Maintenance' + Math.floor(Math.random() * 1000000), { role: 'maintenance', full: false, home: "W3N4" });
        }
        else if(strategyUpgrade.spawn(room.controller)) {}
        else if(strategyExpansion.spawn(Game.spawns['Main'])) { }
        
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
            const links = room.find(FIND_MY_STRUCTURES, {filter: (structure) => { return structure.structureType == STRUCTURE_LINK; }});
            for(var i=0, len=links.length; i<len; ++i)
            {
                if(links[i].id != room.memory.linkReqEnergy && links[i].cooldown == 0 && links[i].energy == links[i].energyCapacity)
                {
                    links[i].transferEnergy(Game.getObjectById(room.memory.linkReqEnergy));
                    delete room.memory.linkReqEnergy;
                    break;
                }
            }
        }
    }
};

module.exports = roomBase;