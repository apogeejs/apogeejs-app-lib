import CommandManager from "/apogeejs-app-lib/src/commands/CommandManager.js";

/*
 * This command updates an arbitrary field in a component.

 * Command JSON format:
 * {
 *   "type":"updateComponentField",
 *   "memberId":(main member ID),
 *   "fieldName": (the name of the field being updated),
 *   "initialValue":(original field value)
 *   "targetValue": (desired field value)
 * }
 */ 
let updateComponentField = {};

updateComponentField.createUndoCommand = function(workspaceManager,commandData) {
    let undoCommandData = {};
    undoCommandData.memberId = commandData.memberId;
    undoCommandData.fieldName = commandData.fieldName;
    undoCommandData.initialValue = commandData.targetValue;
    undoCommandData.targetValue = commandData.initialValue;
    return undoCommandData;
}

updateComponentField.executeCommand = function(workspaceManager,commandData) {
    let modelManager = workspaceManager.getMutableModelManager();
    let componentId = modelManager.getComponentIdByMemberId(commandData.memberId);
    let component = modelManager.getMutableComponentByComponentId(componentId);
    if(component) {
        try {
            component.setField(commandData.fieldName,commandData.targetValue);
        }
        catch(error) {
            if(error.stack) console.error(error.stack);
            let msg = error.message ? error.message : error;
            throw new Error("Exception on custom component update: " + msg);
        }
    }
    else {
        throw new Error("Component not found: " + commandData.memberId);
    }
}

updateComponentField.commandInfo = {
    "type": "updateComponentField",
    "targetType": "component",
    "event": "updated"
}

CommandManager.registerCommand(updateComponentField);


