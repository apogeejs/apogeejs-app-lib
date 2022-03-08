import Component from "/apogeejs-app-lib/src/component/Component.js";
import {getFormComponentDefaultMemberJson} from "/apogeejs-app-lib/src/components/formInputComponentUtils.js";
import {defineHardcodedDataMember} from "/apogeejs-model-lib/src/apogeeModelLib.js";

import {getConfigViewModeEntry} from "/apogeejs-view-lib/src/componentviews/FormInputBaseComponentView.js";
import ConfigurableFormEditor from "/apogeejs-view-lib/src/datadisplay/ConfigurableFormEditor.js";
import {getFormulaViewModeEntry,getPrivateViewModeEntry,getMemberDataTextViewModeEntry} from "/apogeejs-view-lib/src/datasource/standardDataDisplay.js";
import dataDisplayHelper from "/apogeejs-view-lib/src/datadisplay/dataDisplayHelper.js";
import {ConfigurablePanel} from "/apogeejs-ui-lib/src/apogeeUiLib.js"
import {Messenger} from "/apogeejs-model-lib/src/apogeeModelLib.js";


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

///////////////////////////////////////////////////////
// view code
////////////////////////////////////////////////////////


/** This method returns the form layout.
 * @protected. */
 function getFormLayout(component) {
    let flags = {
        "inputExpressions": component.getField("allowInputExpressions"),
        "submit": false
    }
    return ConfigurablePanel.getFormDesignerLayout(flags);
}

function getFormViewDataDisplay(componentHolder,displayContainer) {
    let dataDisplaySource = _getOutputFormDataSource(componentHolder);
    return new ConfigurableFormEditor(displayContainer,dataDisplaySource);
}

function _getOutputFormDataSource(componentHolder) {

    return {
        //This method reloads the component and checks if there is a DATA update. UI update is checked later.
        doUpdate: () => {
            //return value is whether or not the data display needs to be udpated
            let component = componentHolder.getComponent()
            let reloadData = component.isMemberDataUpdated("member.value");
            let reloadDataDisplay = component.isMemberFieldUpdated("member.data","data");
            return {reloadData,reloadDataDisplay};
        },

        getDisplayData: () =>  dataDisplayHelper.getWrappedMemberData(componentHolder.getComponent(),"member.data"),

        getData: () => dataDisplayHelper.getWrappedMemberData(componentHolder.getComponent(),"member.value"),

        getEditOk: () => true,

        saveData: (formValue) => {
            let component = componentHolder.getComponent()
            let isValidMember = component.getField("member.isValid");
            let isValidFunction;
            let issueMessage;
            switch(isValidMember.getState()) {
                case apogeeutil.STATE_NORMAL:
                    isValidFunction = isValidMember.getData();
                    break;

                case apogeeutil.STATE_PENDING:
                    issueMessage = "Validator function pending! Can not process submit button.";
                    break;

                case apogeeutil.STATE_INVALID:
                    issueMessage = "Validator function invalid! Can not process submit button.";
                    break;

                case apogeeutil.STATE_ERROR:
                    issueMessage = "Validator function error: " + isValidMember.getErrorMsg();
                    break;
            }

            if(isValidFunction) {
                try {
                    let isValidResult = isValidFunction(formValue);
                    if(isValidResult === true) {
                        //save data
                        let memberId = component.getMemberId();
                        let runContextLink = component.getApp().getWorkspaceManager().getRunContextLink();
                        let messenger = new Messenger(runContextLink,memberId);
                        messenger.dataUpdate("value",formValue);
                        return true;
                    }
                    else {
                        //isValidResult should be the error message. Check to make sure if it is string, 
                        //since the user may return false. (If so, give a generic error message)
                        let msg = ((typeof isValidResult) == "string") ? isValidResult : "Invalid form value!";
                        apogeeUserAlert(msg);
                        return false;
                    }
                }
                catch(error) {
                    if(error.stack) console.error(error.stack);
                    apogeeUserAlert("Error validating input: " + error.toString());
                }
            }
            else {
                apogeeeUserAlert(issueMessage);
                return false;
            }
        }
    }
}


const DesignerDataFormComponentConfig = {
    componentClass: Component,
	displayName: "Data Form Cell",
	defaultMemberJson: getFormComponentDefaultMemberJson(dataMemberTypeName,ADDITIONAL_CHILD_MEMBER_ARRAY),
    defaultComponentJson: {
        type: "apogeeapp.DesignerDataFormCell",
        fields: {
            allowInputExpressions: true
        }
    },

    viewModes: [
        {
            name: "Form",
            label: "Form", 
            isActive: true,
            getDataDisplay: (componentHolder,displayContainer) => getFormViewDataDisplay(componentHolder,displayContainer)
        },
        getConfigViewModeEntry(getFormLayout,"Form Designer"),
        getFormulaViewModeEntry("member.isValid",{name:"IsValidFunction",label:"IsValid Function",argList:"formValue"}),
        getPrivateViewModeEntry("member.isValid",{name:"IsValidPrivate",label:"IsValid Private"}),
        getMemberDataTextViewModeEntry("member.value")
    ],
    iconResPath: "/icons3/formCellIcon.png",
    propertyDialogEntries: [
        {
            propertyKey: "allowInputExpressions",
            dialogElement: {
                "type":"checkbox",
                "label":"Allow Designer Input Expressions: ",
                "value": true,
                "key":"allowInputExpressions"
            }
        }
    ]
}
export default DesignerDataFormComponentConfig;



