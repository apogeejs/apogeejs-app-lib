import Component from "/apogeejs-app-lib/src/component/Component.js";
import {getFormComponentDefaultMemberJson} from "/apogeejs-app-lib/src/components/formInputComponentUtils.js";
import {defineHardcodedDataMember} from "/apogeejs-model-lib/src/apogeeModelLib.js";

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
            allowInputExpressions: true
        }
    }
}
export default DesignerActionFormComponentConfig;


