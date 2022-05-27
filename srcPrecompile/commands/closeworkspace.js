import CommandManager from "/apogeejs-app-lib/src/commands/CommandManager.js";

let closeworkspace = {};

//=====================================
// Action
//=====================================

//NO UNDO FOR CLOSE Workspace
//closeworkspace.createUndoCommand = function(workspaceManager,commandData) {

closeworkspace.executeCommand = function(workspaceManager,commandData) {
    workspaceManager.close();
}

closeworkspace.commandInfo = {
    "type": "closeWorkspace",
    "targetType": "workspace",
    "event": "deleted"
}

CommandManager.registerCommand(closeworkspace);




