import CommandManager from "/apogeejs-app-lib/src/commands/CommandManager.js";

/** Delete Link Command
 *
 * Command JSON format:
 * {
 *   "type":"deleteLink",
 *   "entryType":(entry type),
 *   "url":(url)
 * }
 */ 
let deletelink = {};

//=====================================
// Command Object
//=====================================

deletelink.createUndoCommand = function(workspaceManager,commandData) {
    
    var undoCommandJson;

    var referenceManager = workspaceManager.getReferenceManager();
    var referenceEntry = referenceManager.getRefEntryById(commandData.id);

    if(referenceEntry) {
        undoCommandJson = {};
        undoCommandJson.type = "addLink";
        undoCommandJson.data = referenceEntry.getData();
        undoCommandJson.specialCaseId = commandData.id;
    }
    
    return undoCommandJson;
}

deletelink.executeCommand = function(workspaceManager,commandData) {
    var referenceManager = workspaceManager.getMutableReferenceManager();
    
    //lookup entry
    let referenceEntry = referenceManager.getRefEntryById(commandData.id);
    if(!referenceEntry) throw new Error("Reference entry not found. refEntryId: " + refEntryId);

    referenceEntry.removeEntry();
    referenceManager.unregisterRefEntry(referenceEntry);
}

deletelink.commandInfo = {
    "type": "deleteLink",
    "targetType": "link",
    "event": "deleted"
}

CommandManager.registerCommand(deletelink);











