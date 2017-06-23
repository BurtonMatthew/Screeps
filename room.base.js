var strategyExpansion = require('strategy.expansion');
var strategyHarvest = require('strategy.harvest');

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
        const creeps = room.find(FIND_MY_CREEPS);
        
        var anySpawn = false;
        for(var j=0, len=sources.length; j<len && !anySpawn; ++j)
        {
            anySpawn |= strategyHarvest.spawn(Game.spawns['Main'], sources[j]);
        }
        
        //if(hostiles.length > 0)
        //{
            //Panic!
        //    Game.spawns['Main'].createCreep( [MOVE, ATTACK, ATTACK, ATTACK, TOUGH, TOUGH, TOUGH, TOUGH, ATTACK, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH], 'Fighter' + Math.floor(Math.random() * 1000000), { role: 'fighter', home: "W3N4" });
        //}
        if(creeps.length < 4) // Emergency no harvester case
        {
            Game.spawns['Main'].createCreep( [WORK, CARRY, MOVE], 'Harvester' + Math.floor(Math.random() * 1000000), { role: 'harvester', full: false });
        }
        else if(anySpawn) {}
        else if(explorers.length < 1)
        {
            Game.spawns['Main'].createCreep( [MOVE], 'Explorer' + Math.floor(Math.random() * 1000000), { role: 'explorer' });
        }
        else if(conSites.length > 0 && builders.length < 3)
        {
            Game.spawns['Main'].createCreep( [WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE], 'Builder' + Math.floor(Math.random() * 1000000), { role: 'builder', home: "W3N4" });
        }
        else if(repairSites.length > 0 && maintenances.length < 2)
        {
            Game.spawns['Main'].createCreep( [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 'Maintenance' + Math.floor(Math.random() * 1000000), { role: 'maintenance', full: false, home: "W3N4" });
        }
        else if(upgraders.length < 1)
        {
            Game.spawns['Main'].createCreep( [WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 'Upgrader' + Math.floor(Math.random() * 1000000), { role: 'upgrader', full: false, home: "W3N4" });
        }
        else if(linkupgraders.length < 2)
        {
            Game.spawns['Main'].createCreep( [WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE], 'LUpgrader' + Math.floor(Math.random() * 1000000), { role: 'linkupgrader', full: false, linkId: "bc5c202cb431753" });
        }
        else if(strategyExpansion.spawn(Game.spawns['Main']))
        {
            
        }
        /*
        else if(refillers.length < 1)
        {
            Game.spawns['Main'].createCreep( [MOVE,MOVE,CARRY,CARRY], "Refiller" + Math.floor(Math.random() * 1000000), { role: 'refiller' });
        }
        else
        {
            Game.spawns['Main'].createCreep( [MOVE, RANGED_ATTACK], "Harass" + Math.floor(Math.random() * 1000000), { role: 'harasser' });
        }
        */
        
        if(hostiles.length > 0)
        {
            for(var i=0; i<towers.length; ++i)
            {
                var towerTarget = towers[i].pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                towers[i].attack(towerTarget);
            }
        }
        
         var link1 = Game.getObjectById("a5bf1c06c714504");
         var link2 = Game.getObjectById("bc5c202cb431753");
         
         if(link1.energy > 400 && link2.energy == 0)
         {
             link1.transferEnergy(link2);
         }
         
        if(room.memory.linkReqEnergy !== undefined)
        {
            const links = room.find(FIND_MY_STRUCTURES, {filter: (structure) => { return structure.structureType == STRUCTURE_LINK; }});
            for(var i=0, len=links.length; i<len; ++i)
            {
                if(links[i] != link1 && links[i].id != room.memory.linkReqEnergy && links[i].cooldown == 0 && links[i].energy == links[i].energyCapacity)
                {
                    links[i].transferEnergy(Game.getObjectById(room.memory.linkReqEnergy));
                    room.memory.linkReqEnergy = undefined;
                    break;
                }
            }
        }
    }
};

module.exports = roomBase;