import {doAction} from "/apogeejs-model-lib/src/apogeeModelLib.js";

import CommandManager from "/apogeejs-app-lib/src/commands/CommandManager.js";
import {getSetCodeAction, getMemberStateUndoCommand} from  "/apogeejs-app-lib/src/commands/membersave.js";


/** Save Member Data Command
 *
 * Command JSON format:
 * {
 *   "type":"saveMembeData",
 *   "memberId":(main member ID),
 *   "argList":(argument list json array),
 *   "functionBody":(function body)
 *   "supplementalCode":(supplementalCode code - optional)
 * }
 */ 
let savemembercode = {};

//=====================================
// Action
//=====================================

savemembercode.createUndoCommand = function(workspaceManager,commandData) {
    let modelManager = workspaceManager.getModelManager();
    let model = modelManager.getModel();
    var undoCommandJson = getMemberStateUndoCommand(model,commandData.memberId); 
    return undoCommandJson;
}

savemembercode.executeCommand = function(workspaceManager,commandData) {
    
    let modelManager = workspaceManager.getMutableModelManager();
    let model = modelManager.getMutableModel();
    
    var actionData = getSetCodeAction(model,
        commandData.memberId,
        commandData.argList,
        commandData.functionBody,
        commandData.supplementalCode);
    
    var actionResult = doAction(model,actionData);
    if(!actionResult.actionDone) {
        throw new Error("Error saving member code: " + actionResult.errorMsg);
    }
}

savemembercode.commandInfo = {
    "type": "saveMemberCode",
    "targetType": "component",
    "event": "updated"
}

CommandManager.registerCommand(savemembercode);










