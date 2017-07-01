var FAIL = 0;
var SUCCESS = 1;
var INPROGRESS = 2;
var behaviourTree = 
{
    FAIL: FAIL,
    SUCCESS: SUCCESS,
    INPROGRESS: INPROGRESS,

    select: function()
    {
        for (var i = 0, len = arguments.length; i < len; ++i) 
        {
            const nodeResult = arguments[i]();
            if(nodeResult != FAIL)
                return nodeResult;
        }
        return FAIL;
    },

    sequence: function()
    {
        for (var i = 0, len = arguments.length; i < len; ++i) 
        {
            const nodeResult = arguments[i]();
            if(nodeResult != SUCCESS)
                return nodeResult;
        }
        return SUCCESS;
    },

    sequenceArray: function(treeNode, arr)
    {
        for(var i=0, len=arr.length; i<len; ++i)
        {
            const nodeResult = treeNode(arr[i]);
            if(nodeResult != SUCCESS)
                return nodeResult;
        }
        return SUCCESS;
    },
};

module.exports = behaviourTree;