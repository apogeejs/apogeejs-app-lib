import CommandManager from "/apogeejs-app-lib/src/commands/CommandManager.js";

/*
 * This command updates the link status when a link is loaded, or fails to load.

 * Command JSON format:
 * {
 *   "type":"linkLoaded",
 *   "entryType":(entry type),
 *   "url":(url),
 *   "success":(boolean),
 *   "error":(error object or error string - optional. Only used in the success=false case)
 * }
 * 
 */ 

let linkLoaded = {};

//No undo command. Only the original call needs to be undone.
//updatelinkstatus.createUndoCommand = function(workspaceManager,commandData) {

linkLoaded.executeCommand = function(workspaceManager,commandData) {
    
    var commandResult = {};
    var referenceManager = workspaceManager.getMutableReferenceManager();
    
    //lookup entry for this reference
    let referenceEntry = referenceManager.getMutableRefEntryById(commandData.id);
    if(referenceEntry) {
        //update entry status
        //add event handlers
        if(commandData.success) {
            commandResult.cmdDone = true;
            referenceEntry.setClearState();
            if(commandData.data) {
                referenceEntry.setField("data",data);
            }
        }
        else {
            var errorMsg = "Failed to load link '" + referenceEntry.getDisplayName() + "':" + commandData.error.toString();
            console.error(errorMsg);
            referenceEntry.setError(errorMsg);
        }

        //save the updated entry
        referenceManager.registerRefEntry(referenceEntry);
    }
    else {
        //reference entry not found
        throw new Error("Reference entry not found: " + commandData.id);
    }
    
    return commandResult;
}

linkLoaded.commandInfo = {
    "type": "linkLoaded",
    "targetType": "referenceEntry",
    "event": "updated"
}

CommandManager.registerCommand(linkLoaded);
