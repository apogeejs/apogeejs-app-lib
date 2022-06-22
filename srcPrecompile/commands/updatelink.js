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
    let referenceManager = workspaceManager.getMutableReferenceManager()
    referenceManager.updateEntry(workspaceManager,commandData.id,commandData.data)
}

updatelink.commandInfo = {
    "type": "updateLink",
    "targetType": "component",
    "event": "updated"
}

CommandManager.registerCommand(updatelink);











