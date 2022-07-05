import Component from "/apogeejs-app-lib/src/component/Component.js";
import {getFormComponentDefaultMemberJson} from "/apogeejs-app-lib/src/components/formInputComponentUtils.js";
import {defineHardcodedDataMember} from "/apogeejs-model-lib/src/apogeeModelLib.js";

import {getConfigViewModeEntry} from "/apogeejs-app-lib/src/components/FormInputBaseComponentView.js";
import ConfigurableFormEditor from "/apogeejs-app-lib/src/datadisplay/ConfigurableFormEditor.js";
import {getFormulaViewModeEntry,getPrivateViewModeEntry,getMemberStringifiedJsonViewModeEntry} from "/apogeejs-app-lib/src/datasource/standardDataDisplay.js";
import dataDisplayHelper from "/apogeejs-app-lib/src/datadisplay/dataDisplayHelper.js";
import {ConfigurablePanel} from "/apogeejs-ui-lib/src/apogeeUiLib.js"
import {Messenger} from "/apogeejs-model-lib/src/apogeeModelLib.js";
import VanillaViewModeElement from "/apogeejs-app-lib/src/datadisplay/VanillaViewModeElement.js";


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

function getFormViewDataDisplay(component) {
    let dataDisplaySource = _getOutputFormDataSource();
    return new ConfigurableFormEditor(component,dataDisplaySource);
}

function _getOutputFormDataSource() {

    return {
        //This method reloads the component and checks if there is a DATA update. UI update is checked later.
        doUpdate: (component) => {
            //return value is whether or not the data display needs to be udpated
            let reloadData = component.isMemberDataUpdated("value.member");
            let reloadDataDisplay = component.isMemberFieldUpdated("data.member","data");
            return {reloadData,reloadDataDisplay};
        },

        getDisplayData: (component) =>  dataDisplayHelper.getWrappedMemberData(component,"data.member"),

        getData: (component) => dataDisplayHelper.getWrappedMemberData(component,"value.member"),

        getEditOk: (component) => true,

        saveData: (formValue,component) => {
            let isValidMember = component.getField("isValid.member");
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
            getViewModeElement: (component,showing,setEditModeData,setMsgData,size,setSizeCommandData) => <VanillaViewModeElement
				component={component}
				getDataDisplay={getFormViewDataDisplay}
                setEditModeData={setEditModeData}
                setMsgData={setMsgData}
				showing={showing} 
                size={size}
                setSizeCommandData={setSizeCommandData} />

        },
        getConfigViewModeEntry(getFormLayout,"Form Designer"),
        getFormulaViewModeEntry("isValid.member",{name:"IsValidFunction",label:"IsValid Function",argList:"formValue"}),
        getPrivateViewModeEntry("isValid.member",{name:"IsValidPrivate",label:"IsValid Private"}),
        getMemberStringifiedJsonViewModeEntry("value.member")
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



