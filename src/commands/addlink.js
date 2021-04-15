import CommandManager from "/apogeejs-app-lib/src/commands/CommandManager.js";

/** Add Link Command
 *
 * Command JSON format:
 * {
 *   "type":"addLink",
 *   "entryType":(entry type),
 *   "url":(url),
 *   "nickname":(nickname - optional)
 * }
 */ 
let addlink = {};

//=====================================
// Command Object
//=====================================

addlink.createUndoCommand = function(workspaceManager,commandData) {
    var undoCommandJson = {};
    undoCommandJson.type = "deleteLink";
    undoCommandJson.entryType = commandData.data.entryType;
    undoCommandJson.url = commandData.url;
    return undoCommandJson;
}

addlink.executeCommand = function(workspaceManager,commandData) {
    let referenceManager = workspaceManager.getMutableReferenceManager();
    //this creates the entry but does not load it
    let referenceEntry = referenceManager.createEntry(commandData.data);
    //this loads the entry - it will cause an asynchronouse command on completion
    referenceEntry.loadEntry(workspaceManager);
}

addlink.commandInfo = {
    "type": "addLink",
    "targetType": "link",
    "event": "created"
}

CommandManager.registerCommand(addlink);











