import CommandManager from "/apogeejs-app-lib/src/commands/CommandManager.js";

/** Add Link Command
 *
 * Command JSON format:
 * {
 *   "type":"addLink",
 *   "entryType":(entry type),
 *   "data":(data),
 * }
 */ 
let addlink = {};

//=====================================
// Command Object
//=====================================

//////////////////////
//undo command is a return value for execute command - but this is a temp fix. 
//I need to decide if I want to make this policy.
//////////////////////
//addlink.createUndoCommand = function(workspaceManager,commandData);

addlink.executeCommand = function(workspaceManager,commandData,makeUndo) {
    let referenceManager = workspaceManager.getMutableReferenceManager();
    //this creates the entry but does not load it
    let referenceEntry = referenceManager.createEntry(commandData.entryType,commandData.data);
    //this loads the entry - it will cause an asynchronouse command on completion
    referenceEntry.loadEntry(workspaceManager);

    
    /////////////////////////////////////
    // temporary execute command return value logic
    //I will have to move this into theproper undo command or fix the command manager
    if(makeUndo) {
        var undoCommandJson = {};
        undoCommandJson.type = "deleteLink";
        undoCommandJson.id = referenceEntry.getId();
        return undoCommandJson;
    }
    //////////////////////////////////////
}

addlink.commandInfo = {
    "type": "addLink",
    "targetType": "link",
    "event": "created"
}

CommandManager.registerCommand(addlink);











