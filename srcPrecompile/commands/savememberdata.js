import {doAction} from "/apogeejs-model-lib/src/apogeeModelLib.js";

import CommandManager from "/apogeejs-app-lib/src/commands/CommandManager.js";
import {getSaveDataAction, getMemberStateUndoCommand} from  "/apogeejs-app-lib/src/commands/membersave.js";


/** Save Member Data Command
 *
 * Command JSON format:
 * {
 *   "type":"saveMemberData",
 *   "memberId":(main member Id),
 *   "data":(member data value)
 * }
 */ 
let savememberdata = {};

//=====================================
// Action
//=====================================

savememberdata.createUndoCommand = function(workspaceManager,commandData) {
    let modelManager = workspaceManager.getModelManager();
    let model = modelManager.getModel();
    var undoCommandJson = getMemberStateUndoCommand(model,commandData.memberId); 
    return undoCommandJson;
}

savememberdata.executeCommand = function(workspaceManager,commandData) {
    let modelManager = workspaceManager.getMutableModelManager();
    let model = modelManager.getMutableModel(workspaceManager);
    
    var actionData = getSaveDataAction(model,commandData.memberId,commandData.data);
    
    var actionResult = doAction(model,actionData);
    if(!actionResult.actionDone) {
        throw new Error("Error saving member data: " + actionResult.errorMsg);
    }
}

savememberdata.commandInfo = {
    "type": "saveMemberData",
    "targetType": "component",
    "event": "updated"
}

CommandManager.registerCommand(savememberdata);










