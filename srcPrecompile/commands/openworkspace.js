import CommandManager from "/apogeejs-app-lib/src/commands/CommandManager.js";
import Apogee from "/apogeejs-app-lib/src/Apogee.js";
import WorkspaceManager from "/apogeejs-app-lib/src/WorkspaceManager.js";

/** Open Workspace Command
 *
 * Command JSON format:
 * {
 *   "type":"openWorkspace",
 *   "workspaceJson":(workspace JSON),
 *   "fileMetadata":(file metadata)
 * }
 */ 
let openworkspace = {};

//=====================================
// Action
//=====================================

//NO UNDO FOR OPEN Workspace
//openworkspace.createUndoCommand = function(workspaceManager,commandData) {

openworkspace.executeCommand = function(workspaceManager,commandData) {
    workspaceManager.load(commandData.workspaceJson,commandData.fileMetadata);
}

openworkspace.commandInfo = {
    "type": "openWorkspace",
    "targetType": "workspace",
    "event": "created"
}

CommandManager.registerCommand(openworkspace);



