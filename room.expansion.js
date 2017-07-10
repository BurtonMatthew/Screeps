let c = require('consts');
let utils = require('utils');
let roomLayout = require('room.layout');
let strategyHarvest = require('strategy.harvest');
let strategyExpansion = require('strategy.expansion');
let strategyUpgrade = require('strategy.upgrade');
let strategyBuild = require('strategy.build');
let strategyHarvestRemote = require('strategy.harvest.remote');
let bTree = require('behaviourTree');


function getBodyPartsBuilder(room)
{
    var roomEnergy = room.energyCapacityAvailable;
    var workParts = 0;
    var totalParts = 2;
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

        bTree.sequence
        (
             _.partial(ensureBaseHarvesters, room)
            ,_.partial(bTree.sequenceArray, strategyHarvest.spawn, sources)
            ,_.partial(bTree.sequenceArray, strategyHarvest.spawn, minerals)
            ,_.partial(strategyBuild.spawn, room)
            ,_.partial(ensureBaseMaintenances, room)
            ,_.partial(strategyUpgrade.spawn, room.controller)
            ,_.partial(strategyExpansion.spawn, room)
            ,_.partial(ensureExplorers, room)
            ,_.partial(dumpToTerm, room)
            ,_.partial(strategyHarvestRemote.ensureRemoteHarvest, room)
        );
            
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
    }
}
module.exports = roomExpansion;