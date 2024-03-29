import {doAction} from "/apogeejs-model-lib/src/apogeeModelLib.js";

import CommandManager from "/apogeejs-app-lib/src/commands/CommandManager.js";

let movecomponent = {};

//=====================================
// Action
//=====================================


/** This creates the command. Both the initial and full names should be passed in 
 * even is they are the same. */
movecomponent.createUndoCommand = function(workspaceManager,commandData) {
    let modelManager = workspaceManager.getModelManager();
    var model = modelManager.getModel();
    var member = model.lookupObjectById(commandData.memberId);
    var parent = member.getParent(model);
    var oldMemberName = member.getName();
    
    var undoCommandJson = {};
    undoCommandJson.type = movecomponent.commandInfo.type;
    undoCommandJson.memberId = commandData.memberId;
    undoCommandJson.newMemberName = oldMemberName;
    undoCommandJson.newParentId = parent.getId();
    
    return undoCommandJson;
}

movecomponent.executeCommand = function(workspaceManager,commandData) {
    
    let modelManager = workspaceManager.getMutableModelManager();
    let model = modelManager.getMutableModel(workspaceManager);

    var actionData = {};
    actionData.action = "moveMember";
    actionData.memberId = commandData.memberId;
    actionData.targetName = commandData.newMemberName;
    actionData.targetParentId = commandData.newParentId;

    let actionResult = doAction(model,actionData);
    if(!actionResult.actionDone) {
        throw new Error("Error moving member: " + actionResult.errorMsg);
    }
}

movecomponent.commandInfo = {
    "type": "moveComponent",
    "targetType": "component",
    "event": "updated"
}

CommandManager.registerCommand(movecomponent);


