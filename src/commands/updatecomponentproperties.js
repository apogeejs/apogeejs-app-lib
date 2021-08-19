import {doAction} from "/apogeejs-model-lib/src/apogeeModelLib.js";

import CommandManager from "/apogeejs-app-lib/src/commands/CommandManager.js";

/** Update Component Command
 *
 * Command JSON format:
 * {
 *   "type":"updateComponentProperties",
 *   "memberId":(main member ID),
 *   "updatedMemberProperties":(member property json),
 *   "updatedComponentProperties":(component property json)
 * }
 */ 
let updateComponentProperties = {};

//=====================================
// Command Object
//=====================================

updateComponentProperties.createUndoCommand = function(workspaceManager,commandData) {
    let modelManager = workspaceManager.getModelManager();
    let model = modelManager.getModel();
    var member = model.lookupMemberById(commandData.memberId);
    var componentId = modelManager.getComponentIdByMemberId(commandData.memberId);
    var component = modelManager.getComponentByComponentId(componentId);
  
    let undoMemberProperties
    if(commandData.updatedMemberProperties) {
        undoMemberProperties = _getMemberUndoJson(model,member,commandData.updatedMemberProperties);
    }
    
    let undoComponentProperties
    if(commandData.updatedComponentProperties) {
        undoComponentProperties = _getComponentUndoJson(modelManager,component,commandData.updatedComponentProperties);
    }
    
    var undoCommandJson = {};
    undoCommandJson.type = updateComponentProperties.commandInfo.type;
    undoCommandJson.memberId = commandData.memberId;
    if(undoMemberProperties) undoCommandJson.updatedMemberProperties = undoMemberProperties;
    if(undoComponentProperties) undoCommandJson.updatedComponentProperties = undoComponentProperties;
    
    return undoCommandJson;
}

/** This method is used for updating property values from the property dialog. 
 * If there are additional property lines, in the generator, this method should
 * be extended to edit the values of those properties too. */
updateComponentProperties.executeCommand = function(workspaceManager,commandData) {
    
    let modelManager = workspaceManager.getMutableModelManager();
    //wait to get a mutable model instance only if we need it
    let model = modelManager.getModel();
    var member = model.lookupMemberById(commandData.memberId);
    var componentId = modelManager.getComponentIdByMemberId(commandData.memberId);
    var component = modelManager.getMutableComponentByComponentId(componentId);
    
    //create an action to update an member additional properties
    let actionResult;
    if((member.getPropertyUpdateAction)&&(commandData.updatedMemberProperties)) {
        var actionData = member.getPropertyUpdateAction(model,commandData.updatedMemberProperties);  
        if(actionData) {
            //get a new, mutable model instance here
            model = modelManager.getMutableModel();
            actionResult = doAction(model,actionData);
            if(!actionResult.actionDone) {
                throw new Error("Error updating member properties: " + actionResult.errorMsg);
            }
        }
    }
 
    //update an component additional properties
    if(commandData.updatedComponentProperties) {
        component.loadPropertyValues(commandData.updatedComponentProperties,modelManager);
    }
}

function _getComponentUndoJson(modelManager,component,doJson) {
    let undoJson = {};
    for(let fieldName in doJson) {
        if(fieldName != "children") {
            undoJson[fieldName] = component.getField(fieldName);
        }
        else {
            if(component.isParentComponent) {
                undoJson.children = {};
                for(let childName in doJson.children) {
                    let childDoJson = doJson.children[childName];
                    let childComponent = component.getChildComponent(modelManager,childName);
                    undoJson.children[childName] = _getComponentUndoJson(modelManager,childComponent,childDoJson);
                }
            }
        }
    }
    return undoJson;
}

function _getMemberUndoJson(model,member,doJson) {
    let undoJson = {};
    if(doJson.fields) {
        undoJson.fields = {};
        for(let fieldName in doJson.fields) {
            undoJson.fields[fieldName] = member.getField(fieldName);
        }
    }
    if((member.isParent)&&(doJson.children)) {
        undoJson.children = {};
        for(let childName in doJson.children) {    
            let childDoJson = doJson.children[childName];
            let childMember = member.lookupChild(model,childName);
            undoJson.children[childName] = _getMemberUndoJson(model,childMember,childDoJson);
        }
    }
    return undoJson;
}

updateComponentProperties.commandInfo = {
    "type": "updateComponentProperties",
    "targetType": "component",
    "event": "updated"
}

CommandManager.registerCommand(updateComponentProperties);


