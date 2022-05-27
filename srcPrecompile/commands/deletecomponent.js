import {doAction} from "/apogeejs-model-lib/src/apogeeModelLib.js";

import CommandManager from "/apogeejs-app-lib/src/commands/CommandManager.js";

let deletecomponent = {};

//=====================================
// Command Object
//=====================================

/*** 
 * This command supports two formats:
 * 
 * Format 1: member ID
 * commandData.type = "deleteComponent"
 * commandData.memberId = (memberId)
 * 
 * Format 2: parent ID, memberName
 * commandData.type = "deleteComponent"
 * commandData.parentId = (parentId)
 * commandData.memberName = (memberName)
 */
deletecomponent.createUndoCommand = function(workspaceManager,commandData) {
    
    //problems
    // - is this member a component main member?
    
    let modelManager = workspaceManager.getModelManager();
    var model = modelManager.getModel();
    let member;
    let parent;

    if(commandData.memberId) {
        member = model.lookupObjectById(commandData.memberId);
        parent = member.getParent(model);
    }
    else {
        parent = model.lookupObjectById(commandData.parentId);
        member = parent.lookupChild(commandData.memberName);
    }

    let componentId = modelManager.getComponentIdByMemberId(member.getId());
    let component = modelManager.getComponentByComponentId(componentId);
    
    var commandUndoJson = {};
    commandUndoJson.type = "addComponent";
    commandUndoJson.parentId = parent.getId();
    commandUndoJson.memberJson = member.toJson(model);
    //this must be added so when we create the member, it matches our "delete" redo command. We do that for component too.
    commandUndoJson.memberJson.specialCaseIdValue = member.getId();
    commandUndoJson.componentJson = component.toJson(modelManager);
    commandUndoJson.componentJson.specialCaseIdValue = componentId;
    
    return commandUndoJson;
}

/** This method deletes the component and the underlying member. It should be passed
 *  the model and the member full name. (We delete by name and model to handle
 *  undo/redo cases where the instance of the member changes.)
 */
deletecomponent.executeCommand = function(workspaceManager,commandData) {
    
    let modelManager = workspaceManager.getMutableModelManager();
    let model = modelManager.getMutableModel(workspaceManager);

    var actionJson = {};
    actionJson.action = "deleteMember";

    if(commandData.memberId) {
        actionJson.memberId = commandData.memberId;
    }
    else {
        let parent = model.lookupObjectById(commandData.parentId);
        let member = parent.lookupChild(model,commandData.memberName);
        actionJson.memberId = member.getId();
    }
    
    var actionResult = doAction(model,actionJson);
    if(!actionResult.actionDone) {
        throw new Error("Error deleting component: " + actionResult.errorMsg);
    }
}

deletecomponent.commandInfo = {
    "type": "deleteComponent",
    "targetType": "component",
    "event": "deleted"
}

CommandManager.registerCommand(deletecomponent);