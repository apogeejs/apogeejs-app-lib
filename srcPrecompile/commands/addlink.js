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
    //check if this entry already exists
    let referenceManager = workspaceManager.getReferenceManager()
    let referenceEntry = getExistingReferenceEntry(entryType,entryData)
    //return, with no undo comand
    if(!referenceEntry) return

    //we need to create the link
    referenceManager = workspaceManager.getMutableReferenceManager();
    referenceManager.createEntry(workspaceManager,commandData.entryType,commandData.data);
    
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











