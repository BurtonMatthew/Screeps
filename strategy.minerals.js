let c = require('consts');
let utils = require('utils');
let bTree = require('behaviourTree');

 /** 
  * @param {Room} room 
  * @param {Number} amount
  * @param {Bool} urgent
  */
function ensureMineral(room, amount, urgent = false)
{
    return bTree.select
    (
         _.partial(hasMineral, room, amount)
        ,_.partial(empireTransferMineral, room, amount)
        ,_.partial(buyMineral, room, amount, urgent)
        ,_.partial(produceMineral, amount)
    );
}

 /** 
  * @param {Room} room 
  * @param {Number} amount
  */
function hasMineral(room, amount)
{
    // Check if we've already got it in storage
    return btree.FAIL;
}

 /** 
  * @param {Room} room 
  * @param {Number} amount
  */
function empireTransferMineral(room, amount)
{
    // Check if another room has spare minerals, ship them over
    return btree.FAIL;
}

 /** 
  * @param {Room} room 
  * @param {Number} amount
  * @param {Bool} urgent
  */
function buyMineral(room, amount, urgent)
{
    // under some circumstances we might want to buy - especially cases for urgent situations or when we can't
    // mine the mineral in question
    return btree.FAIL;
}

 /**  @param {Number} amount */
function produceMineral(amount)
{
    // find an available production room (immediately claim that room? allows simultaneous work on child 
    // reagents but need care to not lock on high level reactions)
    // recursively ensuremineral the reagents
    
    return btree.FAIL;
}



module.exports = {
    ensureMineral
};