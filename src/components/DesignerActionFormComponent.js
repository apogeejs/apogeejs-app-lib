import Component from "/apogeejs-app-lib/src/component/Component.js";
import {getFormComponentDefaultMemberJson} from "/apogeejs-app-lib/src/components/formInputComponentUtils.js";
import {defineHardcodedDataMember} from "/apogeejs-model-lib/src/apogeeModelLib.js";

function onSubmitCodeUpdate(component,submitCode) {
    let onSubmitFunction;
    if((submitCode === undefined)&&(submitCode === null)) submitCode = "";
    
    try {
        //create the validator function
        onSubmitFunction = new Function("cmdMsngr","formValue","formObject",submitCode);
    }
    catch(error) {
        if(error.stack) console.error(error.stack);
        onSubmitFunction = error;
    }

    component.setField("onSubmitFunction",onSubmitFunction);
}

function onCancelCodeUpdate(component,cancelCode) {
    let onCancelFunction;
    if((cancelCode === undefined)&&(cancelCode === null)) cancelCode = "";
    
    try {
        //create the validator function
        onCancelFunction = new Function("cmdMsngr","formObject",cancelCode);
    }
    catch(error) {
        if(error.stack) console.error(error.stack);
        onCancelFunction = error;
    }

    component.setField("onCancelFunction",onCancelFunction);
}


const DATA_MEMBER_FUNCTION_BODY = `
if(formResult) return apogeeui.ConfigurablePanel.getGeneratedFormLayout(formResult);
else return [];
`

//this defines the hardcoded type we will use
const dataMemberTypeName = "apogee.DesignerActionFormMember";
defineHardcodedDataMember(dataMemberTypeName,DATA_MEMBER_FUNCTION_BODY);
const DesignerActionFormComponentConfig = {
    componentClass: Component,
    displayName: "Action Form Cell",
    defaultMemberJson: getFormComponentDefaultMemberJson(dataMemberTypeName),
    defaultComponentJson: {
        type: "apogeeapp.DesignerActionFormCell",
        fields: {
            allowInputExpressions: true,
            onSubmitCode: "",
            onCancelCode: ""
        }
    },
    fieldFunctions: {
		onSubmitCode: {
			fieldChangeHandler: onSubmitCodeUpdate 
		},
        onCancelCode: {
			fieldChangeHandler: onCancelCodeUpdate 
		}
	}
}
export default DesignerActionFormComponentConfig;


