import {defineHardcodedJsonTable} from "/apogeejs-model-lib/src/apogeeModelLib.js";
import FormInputBaseComponent from "/apogeejs-app-lib/src/components/FormInputBaseComponent.js";

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

    //==============================
    // serialization and properties
    //==============================

    writeExtendedData(json,modelManager) {
        json.onSubmitCode = this.getField("onSubmitCode");
        json.onCancelCode = this.getField("onCancelCode");
    }

    writeExtendedProps(json,modelManager) {
        json.allowInputExpressions = this.getAllowInputExpressions();
    }

    loadExtendedData(json) {
        if(json.onSubmitCode) {
            this.updateOnSubmitCode(json.onSubmitCode)
        }
        if(json.onCancelCode) {
            this.updateOnCancelCode(json.onCancelCode)
        }
    }

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

    loadExtendedProps(json) {
        if(json.allowInputExpressions !== undefined) {
            this.setAllowInputExpressions(json.allowInputExpressions);
        }
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

DesignerActionFormComponent.COMPONENT_PROPERTY_MAP = {
    "allowInputExpressions": true
}
DesignerActionFormComponent.COMPONENT_DATA_MAP = {
    "onSubmitCode": "",
    "onCancelCode": ""
}
//DesignerActionFormComponent.MEMBER_PROPERTY_LIST


