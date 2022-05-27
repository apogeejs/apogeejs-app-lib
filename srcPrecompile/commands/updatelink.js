import CommandManager from "/apogeejs-app-lib/src/commands/CommandManager.js";

/** Update Link Command
 *
 * Command JSON format:
 * {
 *    "type":"updateLink",
 *    "data": {
 *        "entryType":(entry type),
 *        "url":(new url - optional),
 *        "nickname":(new nickname - optional),
 *        (other?)
 *    },
 *    "initialUrl": (original url)
 * }
 */ 
let updatelink = {};


updatelink.createUndoCommand = function(workspaceManager,commandData) {
    var undoCommandJson;
    
    var referenceManager = workspaceManager.getReferenceManager();
    var referenceEntry = referenceManager.getRefEntryById(commandData.id);
    if(referenceEntry) {
        undoCommandJson = {};
        undoCommandJson.type = updatelink.commandInfo.type;
        undoCommandJson.id = commandData.id;
        undoCommandJson.data = referenceEntry.getData();
    }
    
    return undoCommandJson;
}

updatelink.executeCommand = function(workspaceManager,commandData) {
    let referenceManager = workspaceManager.getMutableReferenceManager();

    let referenceEntry = referenceManager.getMutableRefEntryById(commandData.id);
    if(!referenceEntry) throw new Error("Reference entry not found. refEntryId: " + commandData.data.entryType);

    //update entry
    referenceEntry.updateData(workspaceManager,commandData.data);

    referenceManager.registerRefEntry(referenceEntry);
}

updatelink.commandInfo = {
    "type": "updateLink",
    "targetType": "component",
    "event": "updated"
}

CommandManager.registerCommand(updatelink);











