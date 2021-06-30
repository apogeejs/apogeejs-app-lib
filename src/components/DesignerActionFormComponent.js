import {defineHardcodedJsonTable} from "/apogeejs-model-lib/src/apogeeModelLib.js";
import FormInputBaseComponent from "/apogeejs-app-lib/src/components/FormInputBaseComponent.js";
import CommandManager from "/apogeejs-app-lib/src/commands/CommandManager.js";

/** This is a simple custom component example. */
export default class DesignerActionFormComponent extends FormInputBaseComponent {
    constructor(member,modelManager,instanceToCopy,keepUpdatedFixed) {
        super(member,modelManager,instanceToCopy,keepUpdatedFixed);

        //==============
        //Fields
        //==============
        if(!instanceToCopy) {
            this.setField("onSubmitCode","");
            this.setField("onCancelCode","");
        }
    }

    getAllowInputExpressions() {
        let allowInputExpressions = this.getField("allowInputExpressions");
        if(allowInputExpressions === undefined) allowInputExpressions = DEFAULT_ALLOW_INPUT_EXPRESSIONS;
        return allowInputExpressions;
    }

    setAllowInputExpressions(allowInputExpressions) {
        let oldAllowInputExpressions = this.getField("allowInputExpressions");
        if(oldAllowInputExpressions != allowInputExpressions) {
            this.setField("allowInputExpressions",allowInputExpressions);
        }
    }

    //==============================
    //Resource Accessors
    //==============================

    /** This method compiles the layout function entered by the user. It returns
     * the fields  {formLayoutFunction,validatorFunction,errorMessage}. */
     createActionFunctions(useSubmit,useCancel) {
        let saveCodeText = this.getField("onSubmitCode");
        let cancelCodeText = this.getField("onCancelCode");
        let onSubmitFunction, onCancelFunction
        let errorMessages = [];

        if(useSubmit) {
            if((saveCodeText !== undefined)&&(saveCodeText !== null))  {
                try {
                    //create the validator function
                    onSubmitFunction = new Function("cmdMsngr","formValue","formObject",saveCodeText);
                }
                catch(error) {
                    errorMessages.push("Error parsing validator function code: " + error.toString());
                    if(error.stack) console.error(error.stack);
                }
            }
            else {
                onSubmitFunction = () => "";
            }
        }

        if(useCancel) {
            if((cancelCodeText !== undefined)&&(cancelCodeText !== null))  {
                try {
                    //create the validator function
                    onCancelFunction = new Function("cmdMsngr","formObject",cancelCodeText);
                }
                catch(error) {
                    errorMessages.push("Error parsing validator function code: " + error.toString());
                    if(error.stack) console.error(error.stack);
                }
            }
            else {
                onCancelFunction = () => "";
            }
        }

        let errorMessage;
        if(errorMessages.length > 0) errorMessage = errorMessages.join("; ");
        return {onSubmitFunction, onCancelFunction, errorMessage};
    }

    //=============================
    // Action
    //=============================

    updateOnSubmitCode(saveCodeText) { 
        let oldSaveCodeText = this.getField("onSubmitCode");
        if(saveCodeText != oldSaveCodeText) {
            this.setField("onSubmitCode",saveCodeText);
        }
    }

    updateOnCancelCode(cancelCodeText) { 
        let oldCancelCodeText = this.getField("onCancelCode");
        if(cancelCodeText != oldCancelCodeText) {
            this.setField("onCancelCode",cancelCodeText);
        }
    }

    //==============================
    // serialization
    //==============================

    readPropsFromJson(json) {
        if(!json) return;

        if(json.onSubmitCode) {
            this.updateOnSubmitCode(json.onSubmitCode)
        }
        if(json.onCancelCode) {
            this.updateOnCancelCode(json.onCancelCode)
        }
        if(json.allowInputExpressions !== undefined) {
            this.setAllowInputExpressions(json.allowInputExpressions);
        }
    }

    /** This serializes the table component. */
    writeToJson(json,modelManager) {
        json.onSubmitCode = this.getField("onSubmitCode");
        json.onCancelCode = this.getField("onCancelCode");
        json.allowInputExpressions = this.getAllowInputExpressions();
    }

    /** This returns the current values for the member and component properties in the  
     * proeprties dialog. */
    readExtendedProperties(values) {
        values.allowInputExpressions = this.getAllowInputExpressions();
    }

    /** This optional static function reads property input from the property 
     * dialog and copies it into a component property json. */
     static transferComponentProperties(inputValues,propertyJson) {
        if(inputValues.allowInputExpressions !== undefined) {
            propertyJson.allowInputExpressions = inputValues.allowInputExpressions;
        }
    }
}

const DEFAULT_ALLOW_INPUT_EXPRESSIONS = true;

const DATA_MEMBER_FUNCTION_BODY = `
if(formResult) return apogeeui.ConfigurablePanel.getGeneratedFormLayout(formResult);
else return [];
`


//this defines the hardcoded type we will use
let dataMemberTypeName = "apogee.DesignerActionFormMember";
defineHardcodedJsonTable(dataMemberTypeName,DATA_MEMBER_FUNCTION_BODY);

//here we define the component
FormInputBaseComponent.initializeClass(DesignerActionFormComponent,"Action Form Cell","apogeeapp.DesignerActionFormCell",dataMemberTypeName);



//=====================================
// Update Data Command
//=====================================

/*
 *
 * Command JSON format:
 * {
 *   "type":"actionFormComponentUpdateCommand",
 *   "memberId":(main member ID),
 *   "field": (field to update "validator")
 *   "initialValue":(original fields value)
 *   "targetValue": (desired fields value)
 * }
 */ 
let designerActionFormUpdateCommand = {};

designerActionFormUpdateCommand.createUndoCommand = function(workspaceManager,commandData) {
    let undoCommandData = {};
    undoCommandData.type = designerActionFormUpdateCommand.commandInfo.type;
    undoCommandData.memberId = commandData.memberId;
    undoCommandData.field = commandData.field;
    undoCommandData.initialValue = commandData.targetValue;
    undoCommandData.targetValue = commandData.initialValue;
    return undoCommandData;
}

designerActionFormUpdateCommand.executeCommand = function(workspaceManager,commandData) {
    let modelManager = workspaceManager.getMutableModelManager();
    let componentId = modelManager.getComponentIdByMemberId(commandData.memberId);
    let component = modelManager.getMutableComponentByComponentId(componentId);
    var commandResult = {};
    if(component) {
        try {
            if(commandData.field == "onSubmit") {
                component.updateOnSubmitCode(commandData.targetValue);
            }
            else if(commandData.field == "onCancel") {
                component.updateOnCancelCode(commandData.targetValue);
            }
            else {
                throw new Error("Internal error: unknown update field: " + commandData.field);
            }

            commandResult.cmdDone = true;
            commandResult.target = component;
            commandResult.eventAction = "updated";
        }
        catch(error) {
            if(error.stack) console.error(error.stack);
            let msg = error.message ? error.message : error;
            commandResult.cmdDone = false;
            commandResult.alertMsg = "Exception on custom component update: " + msg;
        }
    }
    else {
        commandResult.cmdDone = false;
        commandResult.alertMsg = "Component not found: " + commandData.memberId;
    }
    
    return commandResult;
}

designerActionFormUpdateCommand.commandInfo = {
    "type": "designerActionFormUpdateCommand",
    "targetType": "component",
    "event": "updated"
}


CommandManager.registerCommand(designerActionFormUpdateCommand);

