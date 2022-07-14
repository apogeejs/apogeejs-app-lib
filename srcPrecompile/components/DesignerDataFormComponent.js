import {getFormComponentDefaultMemberJson} from "/apogeejs-app-lib/src/components/formInputComponentUtils.js";
import {defineHardcodedDataMember} from "/apogeejs-model-lib/src/apogeeModelLib.js";

import {getConfigViewModeEntry} from "/apogeejs-app-lib/src/components/FormInputBaseComponentView.js";
import ConfigurableFormEditor from "/apogeejs-app-lib/src/datadisplay/ConfigurableFormEditor.js";
import {getFormulaViewModeEntry,getPrivateViewModeEntry,getMemberStringifiedJsonViewModeEntry} from "/apogeejs-app-lib/src/datasource/standardDataDisplay.js";
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

function getSourceState(component,oldSourceState) {

    let layoutMember = component.getField("data.member")
    let formDataMember = component.getField("value.member")
    let isValidMember = component.getField("isValid.member");

    if( (formDataMember.getState() != apogeeutil.STATE_NORMAL) ||
        (layoutMember.getState() != apogeeutil.STATE_NORMAL) ||
        (isValidMember.getState() != apogeeutil.STATE_NORMAL) ) {

        //handle non-normal state - error, pending, invalid value
        if ( !oldSourceState || component.isStateUpdated() ) {
            return {
                hideDisplay: true,
                messageType: DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_INFO,
                message: "Data Unavailable"
            }
        }
        else {
            return oldSourceState
        }
        
    }
    else {
        //handle normal state
        let displayStateUpdated, dataStateUpdated, saveFunctionUpdated
        let displayState, dataState, saveFunction

        //display state
        if( !oldSourceState || layoutMember.isFieldUpdated("data") ) {
            displayStateUpdated = true
            displayState = {layout: layoutMember.getData()}
        }
        else {
            displayStateUpdated = false
        }

        //data state
        if( !oldSourceState || formDataMember.isFieldUpdated("data") ) {
            dataStateUpdated = true
            dataState = {
                data: formDataMember.getData(),
                editOk: true
            }
        }
        else {
            dataStateUpdated = false
        }

        //save function
        if( !oldSourceState || isValidMember.isFieldUpdated("data") ) {
            saveFunctionUpdated = true
            saveFunction = _getSaveData(component,isValidMember)
        }

        if( displayStateUpdated || dataStateUpdated || saveFunctionUpdated ) {
            return {
                displayState: displayStateUpdated ? displayState : oldSourceState.displayState,
                dataState: dataStateUpdated ? dataState : oldSourceState.dataState,
                save: saveFunctionUpdated ? saveFunction : oldSourceState.save,
            }
        }
        else {
            return oldSourceState
        }

    }
}


/** This method returns the form layout.
 * @protected. */
 function getFormLayout(component) {
    let flags = {
        "inputExpressions": component.getField("allowInputExpressions"),
        "submit": false
    }
    return ConfigurablePanel.getFormDesignerLayout(flags);
}

function _getSaveData(component,isValidMember) {
    
    let isValidFunction = isValidMember.getData()
    if(!isValidFunction) isValidFunction = () => true

    let runContextLink = component.getApp().getWorkspaceManager().getRunContextLink()
    let memberId = component.getMemberId()
    let messenger = new Messenger(runContextLink,memberId)
    
    return (formValue) => {
        try {
            let isValidResult = isValidFunction(formValue);
            if(isValidResult === true) {
                //save data
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
            getSourceState: getSourceState,
            getViewModeElement: (sourceState,inEditMode,setEditModeData,verticalSize,cellShowing) => <VanillaViewModeElement
                displayState={sourceState.displayState}
                dataState={sourceState.dataState}
                hideDisplay={sourceState.hideDisplay}
                save={sourceState.save}
                inEditMode={inEditMode}
                setEditModeData={setEditModeData}
                verticalSize={verticalSize}
                cellShowing={cellShowing}
                getDataDisplay={displayState => new ConfigurableFormEditor(displayState)} />
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



