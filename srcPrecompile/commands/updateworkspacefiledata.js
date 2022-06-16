import CommandManager from "/apogeejs-app-lib/src/commands/CommandManager.js";

/** Update Workspace Command
 *
 * Command JSON format:
 * {
 *   "type":"updateWorkspaceFileData",
 *   "isDirty":(sets isDirty: true, false or undefined for no action)
 *   "fileMetaData":(sets file metadata: file metadata or undefined for no action)
 * }
 */ 
let updateworkspace = {};

//=====================================
// Action
//=====================================

updateworkspace.executeCommand = function(workspaceManager,commandData) {

    if(commandData.isDirty === true) {
        workspaceManager.setIsDirty()
    }
    else if(commandData.isDirty === false) {
        workspaceManager.clearIsDirty()
    }

    if(commandData.fileMetadata !== undefined) {
        workspaceManager.setFileMetadata(commandData.fileMetadata)
    }
}

updateworkspace.commandInfo = {
    "type": "updateWorkspaceFileData",
    "targetType": "component",
    "event": "updated"
}

CommandManager.registerCommand(updateworkspace);










