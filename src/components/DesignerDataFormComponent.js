import Component from "/apogeejs-app-lib/src/component/Component.js";
import {getFormComponentDefaultMemberJson} from "/apogeejs-app-lib/src/components/formInputComponentUtils.js";
import {defineHardcodedDataMember} from "/apogeejs-model-lib/src/apogeeModelLib.js";

const DATA_MEMBER_FUNCTION_BODY = `
if(formResult) return apogeeui.ConfigurablePanel.getGeneratedFormLayout(formResult);
else return [];
`

//this defines the hardcoded type we will use
const dataMemberTypeName = "apogee.DesignerDataFormMember";
defineHardcodedDataMember(dataMemberTypeName,DATA_MEMBER_FUNCTION_BODY);

//here we configure the component
const ADDITIONAL_CHILD_MEMBER_ARRAY =  [
    {
        "name": "isValid",
        "type": "apogee.FunctionMember",
        "fields": {
            "argList": ["formValue"],
            "functionBody": "return true;",
            "supplementalCode": ""
        }
    },
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
            allowInputExpressions: true
        }
    }
}
export default DesignerDataFormComponentConfig;



