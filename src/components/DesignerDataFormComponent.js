import Component from "/apogeejs-app-lib/src/component/Component.js";
import {getFormComponentDefaultMemberJson} from "/apogeejs-app-lib/src/components/formInputComponentUtils.js";
import {defineHardcodedJsonTable} from "/apogeejs-model-lib/src/apogeeModelLib.js";

/** This updates the validator function when the validator code is updated. */
function onValidatorCodeUpdate(component,validatorCode) {
    let validatorFunctionFieldValue;
    if((validatorCode === undefined)&&(validatorCode === null)) validatorCode = "";
    
    try {
        //create the validator function
        validatorFunctionFieldValue = new Function("formValue","inputData",validatorCode);
    }
    catch(error) {
        if(error.stack) console.error(error.stack);
        validatorFunctionFieldValue = error;
    }

    component.setField("validatorFunction",validatorFunctionFieldValue);
}

const DATA_MEMBER_FUNCTION_BODY = `
if(formResult) return apogeeui.ConfigurablePanel.getGeneratedFormLayout(formResult);
else return [];
`


//this defines the hardcoded type we will use
const dataMemberTypeName = "apogee.DesignerDataFormMember";
defineHardcodedJsonTable(dataMemberTypeName,DATA_MEMBER_FUNCTION_BODY);

//here we configure the component
const ADDITIONAL_CHILD_MEMBER_ARRAY =  [
    {
        "name": "value",
        "type": "apogee.DataMember",
        "fields": {
            "data": ""
        }
    }
];
const DesignerDataFormComponentConfig = {
    componentClass: Component,
	displayName: "Data Form Cell",
	defaultMemberJson: getFormComponentDefaultMemberJson(dataMemberTypeName,ADDITIONAL_CHILD_MEMBER_ARRAY),
    defaultComponentJson: {
        type: "apogeeapp.DesignerDataFormCell",
        fields: {
            allowInputExpressions: true,
            validatorCode: "return true;"
        }
    },
    fieldFunctions: {
        validatorCode: {
			fieldChangeHandler: onValidatorCodeUpdate 
		}
	}
}
export default DesignerDataFormComponentConfig;



