var utils = require('utils');

function planTowerDrain(name, targetRoomName, stagingRoomPosition)
{
    Memory.assaultPlans[name] = {type: 0, name: name, target: targetRoomName, stagingPos: stagingRoomPosition};
}

function registerConsoleCommands()
{
    global.planTowerDrain = planTowerDrain;
}

function clampRoomBounds(num)
{
    return Math.min(Math.max(num, 0), 49);
}

function run(plan)
{
    const attackerName = "AssaultTowerDrain_Attacker_" + plan.name;
    const attacker2Name = "AssaultTowerDrain_Attacker2_" + plan.name;
    const heal1Name = "AssaultTowerDrain_Heal1_" + plan.name;
    const heal2Name = "AssaultTowerDrain_Heal2_" + plan.name;
    var attacker;
    var attacker2;
    var heal1;
    var heal2;

    if(!Game.creeps[attackerName])
        utils.getCrossmapSpawner(plan.stagingPos.roomName).createCreep([TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE], attackerName);
    else
        attacker = Game.creeps[attackerName];

    if(!Game.creeps[attacker2Name])
        utils.getCrossmapSpawner(plan.stagingPos.roomName).createCreep([TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE], attacker2Name);
    else
        attacker2 = Game.creeps[attacker2Name];

    if(!Game.creeps[heal1Name])
        utils.getCrossmapSpawner(plan.stagingPos.roomName).createCreep([MOVE,MOVE,MOVE,MOVE,HEAL,HEAL,HEAL,HEAL,MOVE,HEAL], heal1Name);
    else
        heal1 = Game.creeps[heal1Name];

    if(!Game.creeps[heal2Name])
        utils.getCrossmapSpawner(plan.stagingPos.roomName).createCreep([MOVE,MOVE,MOVE,MOVE,HEAL,HEAL,HEAL,HEAL,MOVE,HEAL], heal2Name);
    else
        heal2 = Game.creeps[heal2Name];

    var heals = [heal1, heal2];
    var attackers = [attacker, attacker2];

    for(var i=0; i<attackers.length; ++i)
    {
        if(attackers[i])
            runAttacker(plan, attackers[i]);
    }

    for(var i=0; i<heals.length; ++i)
    {
        if(heals[i])
            runHealer(plan, heals[i], attackers);
    }

    if(Game.rooms[plan.target] && Game.rooms[plan.target].find(FIND_HOSTILE_STRUCTURES).length < 2)
    {
        return true;
    }
    return false;
}

function runAttacker(plan, attacker)
{
    if(attacker.hits > 1500)
    {
        if(attacker.pos.roomName != plan.target && attacker.hits == attacker.hitsMax)
            utils.navToRoom(attacker, plan.target);
        else
        {
            const spawns = Game.rooms[attacker.pos.roomName].find(FIND_HOSTILE_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_SPAWN});
            if(spawns.length > 0)
            {
                var dismantleTarget = spawns[0];
                if(!dismantleTarget)
                {
                    const enemyStructs = Game.rooms[attacker.pos.roomName].find(FIND_HOSTILE_STRUCTURES);
                    if(enemyStructs.length > 0) { dismantleTarget = enemyStructs[0]; }
                }
                if(attacker.attack(dismantleTarget) == ERR_NOT_IN_RANGE)
                {
                    attacker.moveTo(dismantleTarget, {maxRooms:1});

                    var structs = attacker.room.lookForAtArea(LOOK_STRUCTURES,
                        clampRoomBounds(attacker.pos.y-1), clampRoomBounds(attacker.pos.x-1), clampRoomBounds(attacker.pos.y+1), clampRoomBounds(attacker.pos.x+1), true);
                    var smallestWallIndex = -1;
                    var smallestWallHits = 3000000000;
                    for(var i=0; i<structs.length; ++i)
                    {
                        if(structs[i].structure.structureType == STRUCTURE_WALL || structs[i].structure.structureType == STRUCTURE_RAMPART)
                        {
                            if(smallestWallHits > structs[i].structure.hits)
                            {
                                smallestWallIndex = i;
                                smallestWallHits = structs[i].structure.hits;
                            }
                        }
                    }
                    if(smallestWallIndex != -1)
                    {
                        attacker.attack(structs[smallestWallIndex].structure);
                    }
                    
                }
            }
        }
    }
    else
    {
        if(attacker.room.name !== plan.stagingPos.roomName)
            attacker.moveTo(new RoomPosition(plan.stagingPos.x, plan.stagingPos.y, plan.stagingPos.roomName), {range:1});
        else
            attacker.moveTo(new RoomPosition(plan.stagingPos.x, plan.stagingPos.y, plan.stagingPos.roomName), {range:1, maxRooms:1});
    } 
}

function runHealer(plan, heal, attackers)
{
    //var creeps = heal1.room.find(FIND_MY_CREEPS, {filter: (c) => c.hits < c.hitsMax});
    if(heal.pos.roomName != plan.stagingPos.roomName)
        utils.navToRoom(heal, plan.stagingPos.roomName);
    else
        heal.moveTo(plan.stagingPos.x, plan.stagingPos.y); 

    if(heal.hits < heal.hitsMax)
        heal.heal(heal);
    else 
    {
        for(var i=0; i < attackers.length; ++i)
        {
            if(attackers[i] && attackers[i].hits < attackers[i].hitsMax && attackers[i].pos.roomName === heal.pos.roomName)
            {
                if(heal.heal(attackers[i]) == ERR_NOT_IN_RANGE)
                {
                    heal.rangedHeal(attackers[i]);
                    //heal.moveTo(attackers[i], {maxRooms:1});
                    break;
                }
            }
        }
    }
        
    //else if(creeps.length > 0)
    //   if(heal1.heal(creeps[0]) == ERR_NOT_IN_RANGE)
    //        heal1.moveTo(creeps[0]); 
}

module.exports = {
    run,
    registerConsoleCommands
};