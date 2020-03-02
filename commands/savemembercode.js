import {doAction} from "/apogee/apogeeCoreLib.js";

import CommandManager from "/apogeeapp/commands/CommandManager.js";
import {getSetCodeAction, getMemberStateUndoCommand} from  "/apogeeapp/commands/membersave.js";


/** Save Member Data Command
 *
 * Command JSON format:
 * {
 *   "type":"saveMembeData",
 *   "memberFullName":(main member full name),
 *   "argList":(argument list json array),
 *   "functionBody":(function body)
 *   "supplementalCode":(supplementalCode code - optional)
 *   "clearCodeDataValue":(value to set data is code cleared - optional)
 * }
 */ 
let savemembercode = {};

//=====================================
// Action
//=====================================

savemembercode.createUndoCommand = function(workspaceManager,commandData) {
    let modelManager = workspaceManager.getModelManager();
    let model = modelManager.getModel();
    var undoCommandJson = getMemberStateUndoCommand(model,commandData.memberFullName); 
    return undoCommandJson;
}

savemembercode.executeCommand = function(workspaceManager,commandData) {
    
    let modelManager = workspaceManager.getModelManager();
    let model = modelManager.getModel();

    //lookup member so we can get the component
    let member = model.getMemberByFullName(commandData.memberFullName);
    
    var actionData = getSetCodeAction(model,
        commandData.memberFullName,
        commandData.argList,
        commandData.functionBody,
        commandData.supplementalCode,
        commandData.clearCodeDataValue);
    
    var actionResult = doAction(model,actionData);
    
    var commandResult = {};
    commandResult.cmdDone = actionResult.actionDone;
    if(commandResult.cmdDone) {
        commandResult.target = modelManager.getComponent(modelManager.getComponent(member));
        commandResult.dispatcher = modelManager;
        commandResult.action = "updated";
    }
    else {
        commandResult.errorMsg = "Error saving data: " + commandData.memberFullName;
    }

    commandResult.actionResult = actionResult;
    
    return commandResult;
}

savemembercode.commandInfo = {
    "type": "saveMemberCode",
    "targetType": "component",
    "event": "updated"
}

CommandManager.registerCommand(savemembercode);










