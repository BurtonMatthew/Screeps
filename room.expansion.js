let c = require('consts');
let utils = require('utils');
let roomLayout = require('room.layout');
let strategyHarvest = require('strategy.harvest');
let strategyExpansion = require('strategy.expansion');
let strategyUpgrade = require('strategy.upgrade');
let strategyBuild = require('strategy.build');
let strategyHarvestRemote = require('strategy.harvest.remote');
let strategyHarvestPower = require('strategy.harvest.power');
let bTree = require('behaviourTree');


function getBodyPartsBuilder(room)
{
    var roomEnergy = room.energyCapacityAvailable;
    var workParts = 0;
    var totalParts = 3;
    if(room.storage && _.sum(room.storage.store) > 800000)
        totalParts = 9;
        
    var parts = [];
    while(workParts < totalParts && roomEnergy >= 200)
    {
        roomEnergy -= 200
        workParts++;
        parts.push(WORK);
        parts.push(MOVE);
        parts.push(CARRY);
    }

    return parts;
}

function ensureBaseHarvesters(room)
{
    const creeps = room.find(FIND_MY_CREEPS);
    const harvesters = _.filter(room.find(FIND_MY_CREEPS), (creep) => creep.memory.role == 'harvester');

    if(creeps.length < 4 && harvesters.length < 3)
        if(utils.getAvailableSpawner(room).createCreep( [WORK, CARRY, MOVE], 'Harvester' + Math.floor(Math.random() * 1000000), { role: 'harvester', full: false, home: room.name }) == OK)
            return bTree.INPROGRESS;
        else
            return bTree.FAIL;

    return bTree.SUCCESS;
}

function ensureBaseMaintenances(room)
{
    const maintenances = _.filter(room.find(FIND_MY_CREEPS), (creep) => creep.memory.role == 'maintenance');
    const conSites = room.find(FIND_CONSTRUCTION_SITES);

    if(maintenances.length < 2)
        if(utils.getAvailableSpawner(room).createCreep(getBodyPartsBuilder(room), 'Maintenance' + Math.floor(Math.random() * 1000000), { role: 'maintenance', full: false, home: room.name }) == OK)
            return bTree.INPROGRESS;
        else
            return bTree.FAIL;
    
    return bTree.SUCCESS;
}

function ensureExplorers(room)
{
    const explorers = _.filter(Game.creeps, (creep) => creep.memory.role == 'explorer');
    if(explorers.length < 1)
        if(utils.getAvailableSpawner(room).createCreep( [MOVE], 'Explorer' + Math.floor(Math.random() * 1000000), { role: 'explorer' }) == OK)
            return bTree.INPROGRESS;
        else
            return bTree.FAIL;
    
    return bTree.SUCCESS;
}

function dumpToTerm(room)
{
    if(Game.creeps["STORE_" +room.name] === undefined
        && room.storage && room.storage.store[RESOURCE_ENERGY] > 50000
        && room.terminal && _.sum(room.terminal.store) < 200000)
    {
        if(room.storage.store[RESOURCE_ENERGY] > 500000)
            utils.getAvailableSpawner(room).createCreep([MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY], "STORE_" + room.name, {role:c.ROLE_TERMINAL_DUMPER, full:false});
        else
            utils.getAvailableSpawner(room).createCreep([MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY], "STORE_" + room.name, {role:c.ROLE_TERMINAL_DUMPER, full:false});
    }

    return bTree.SUCCESS;
}

var roomExpansion = {
    
    /** @param {Room} room **/
    run: function(room) 
    {
        const sources = room.find(FIND_SOURCES);
        const minerals = room.find(FIND_MINERALS);

        const hostiles = room.find(FIND_HOSTILE_CREEPS);
        //if(!Game.creeps["Ranged"])
        //    Game.spawns["Spawn1"].createCreep([RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,MOVE,MOVE,MOVE], "Ranged", {role:"rangedDefense"});

        bTree.sequence
        (
             _.partial(ensureBaseHarvesters, room)
            ,_.partial(bTree.sequenceArray, strategyHarvest.spawn, sources)
            ,_.partial(bTree.sequenceArray, strategyHarvest.spawn, minerals)
            ,_.partial(strategyBuild.spawn, room)
            ,_.partial(ensureBaseMaintenances, room)
            ,_.partial(strategyUpgrade.spawn, room.controller)
            ,_.partial(strategyHarvestRemote.ensureRemoteHarvest, room)            
            ,_.partial(strategyExpansion.spawn, room)
            //,_.partial(ensureExplorers, room)
            //,_.partial(dumpToTerm, room)
            //,_.partial(strategyHarvestPower.harvestPower, room)
        );

        bTree.sequence
        (
            _.partial(strategyHarvestPower.harvestPower, room)
        );
        
        if(hostiles.length > 0)
            utils.getAvailableSpawner(room).createCreep([RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,MOVE,MOVE,MOVE], "Ranged" + Math.floor(Math.random() * 1000000), {role:"rangedDefense"});

        //var rooms = ["E39S4", "E36S8", "E39S9"];
        /*
        if(!Game.creeps["FighterE39S4"])
            Game.spawns["Spawn1"].createCreep([ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,RANGED_ATTACK,RANGED_ATTACK,HEAL], "FighterE39S4", {role:"fighter", home:"E39S4"});
        else if(!Game.creeps["FighterE36S8"])
            Game.spawns["Spawn1"].createCreep([ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,RANGED_ATTACK,RANGED_ATTACK,HEAL], "FighterE36S8", {role:"fighter", home:"E36S8"});
        else if(!Game.creeps["FighterE39S9"])
            Game.spawns["Spawn1"].createCreep([ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,RANGED_ATTACK,RANGED_ATTACK,HEAL], "FighterE39S9", {role:"fighter", home:"E39S9"});
        else if(!Game.creeps["FighterE38S8"])
            Game.spawns["Spawn1"].createCreep([ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,RANGED_ATTACK,RANGED_ATTACK,HEAL], "FighterE39S9", {role:"fighter", home:"E39S9"});
        */

        
        //if(!Game.creeps["FighterE33S2"])
        //    Game.spawns["Spawn1"].createCreep([TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,HEAL], "FighterE33S2", {role:"fighter", home:"E33S2"});
        /*
        else if(!Game.creeps["FighterE38S6"])
            Game.spawns["Spawn1"].createCreep([TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,HEAL], "FighterE38S6", {role:"fighter", home:"E38S6"});
        else if(!Game.creeps["FighterE38S8"])
            Game.spawns["Spawn1"].createCreep([TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,HEAL], "FighterE38S8", {role:"fighter", home:"E38S8"});
        else if(!Game.creeps["FighterE37S7"])
            Game.spawns["Spawn1"].createCreep([TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,HEAL], "FighterE37S7", {role:"fighter", home:"E37S7"});
        */
        
        //Game.spawns["Spawn1"].createCreep([RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,MOVE,MOVE,MOVE], "Ranged" + Math.floor(Math.random() * 1000000), {role:"rangedDefense"});

        /*
        if(room == Game.rooms["E38S1"] || room == Game.rooms["E37S4"])
        {
            utils.spawnToCount(_.partial(utils.getAvailableSpawner, room)
            , 20
            , [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,HEAL,HEAL,HEAL,HEAL,HEAL]
            , "War"
            , {role: "fighter", home: "E38S5"});
        }
        */
        
        //const hostiles = room.find(FIND_HOSTILE_CREEPS);
        const towers = room.find(FIND_MY_STRUCTURES, {filter: (structure) => { return structure.structureType == STRUCTURE_TOWER; }});
            
        if(hostiles.length > 0)
        {
            for(var i=0; i<towers.length; ++i)
            {
                var towerTarget = towers[i].pos.findClosestByRange(FIND_HOSTILE_CREEPS, (c) => c.getActiveBodyparts(HEAL) > 1 );
                if(!towerTarget)
                    towerTarget = towers[i].pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                towers[i].attack(towerTarget);
            }
        }
        
        const links = room.find(FIND_MY_STRUCTURES, {filter: (structure) => { return structure.structureType == STRUCTURE_LINK; }});
        if(room.memory.linkReqEnergy !== undefined)
        {
            const reqLink = Game.getObjectById(room.memory.linkReqEnergy);
            if(reqLink.energy > 600)
            {
                delete room.memory.linkReqEnergy;
            }
            else
            {
                const reqEnergy = reqLink.energyCapacity - reqLink.energy;
                
                for(var i=0, len=links.length; i<len; ++i)
                {
                    if(links[i].id != room.memory.linkReqEnergy && links[i].cooldown == 0 && links[i].energy >= reqEnergy)
                    {
                        links[i].transferEnergy(reqLink);
                        break;
                    }
                }
            }
        }
        else if(room.memory.linkStorage !== undefined)
        {
            const storageLink = Game.getObjectById(room.memory.linkStorage)
            for(var i=0, len=links.length; i<len; ++i)
            {
                if(links[i].id != room.memory.linkStorage && links[i].cooldown == 0 && links[i].energy == links[i].energyCapacity)
                {
                    links[i].transferEnergy(storageLink);
                    break;
                }
            }
        }

        /*
        if(room.terminal && room.terminal.cooldown === 0)
        {
            const maxRsc = _(room.terminal.store)
                                .keys()
                                .filter((key) => key !== RESOURCE_ENERGY)
                                .max((key) => room.terminal.store[key]);

            const orders = Game.market.getAllOrders((ord) => ord.resourceType === maxRsc && ord.type === ORDER_BUY && ord.price >= 1);
            // Todo sort
            if(orders.length > 0)
                Game.market.deal(orders[0].id, room.terminal.store[maxRsc], room.name);
            else if(Game.rooms.W6N2.terminal.store[RESOURCE_ENERGY] < 200000 && room.terminal.store[RESOURCE_ENERGY] > 100000)
            {
                room.terminal.send(RESOURCE_ENERGY, 50000, "W6N2");
            }

        }
        */

        if(room.controller && !room.controller.safeMode && room.controller.safeModeAvailable > 0 && !room.controller.safeModeCooldown)
        {
            if(room.find(FIND_HOSTILE_CREEPS, {filter: (c) => c.pos.x > 4 && c.pos.x < 46 && c.pos.y > 4 && c.pos.y < 46 }).length > 0)
            {
                room.controller.activateSafeMode();
            }
        }
    }
}
module.exports = roomExpansion;