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
    var referenceEntry = referenceManager.lookupEntry(commandData.data.entryType,commandData.oldUrl);
    if(referenceEntry) {
        undoCommandJson = {};
        undoCommandJson.type = updatelink.commandInfo.type;
        undoCommandJson.data = referenceEntry.getData();
        undoCommandJson.initialUrl = commandData.data.url;
    }
    
    return undoCommandJson;
}

updatelink.executeCommand = function(workspaceManager,commandData) {
    let referenceManager = workspaceManager.getMutableReferenceManager();

    let refEntryId = referenceManager.lookupRefEntryId(commandData.data.entryType,commandData.initialUrl);
    if(!refEntryId) throw new Error("Reference entry not found. " + commandData.data.entryType + ":" + commandData.initialUrl);

    let referenceEntry = referenceManager.getMutableRefEntryById(refEntryId);
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











