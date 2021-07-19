import Component from "/apogeejs-app-lib/src/component/Component.js";
import {getFormComponentDefaultMemberJson} from "/apogeejs-app-lib/src/components/formInputComponentUtils.js";
import {defineHardcodedJsonTable} from "/apogeejs-model-lib/src/apogeeModelLib.js";

/** This is a simple custom component example. */
export default class DesignerActionFormComponent extends Component {

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
}

const DATA_MEMBER_FUNCTION_BODY = `
if(formResult) return apogeeui.ConfigurablePanel.getGeneratedFormLayout(formResult);
else return [];
`

//this defines the hardcoded type we will use
const dataMemberTypeName = "apogee.DesignerActionFormMember";
defineHardcodedJsonTable(dataMemberTypeName,DATA_MEMBER_FUNCTION_BODY);

DesignerActionFormComponent.displayName = "Action Form Cell";
DesignerActionFormComponent.uniqueName = "apogeeapp.DesignerActionFormCell";
DesignerActionFormComponent.DEFAULT_MEMBER_JSON = getFormComponentDefaultMemberJson(dataMemberTypeName);

DesignerActionFormComponent.COMPONENT_PROPERTY_MAP = {
    "allowInputExpressions": true
}
DesignerActionFormComponent.COMPONENT_DATA_MAP = {
    "onSubmitCode": "",
    "onCancelCode": ""
}


