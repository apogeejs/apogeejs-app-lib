import {getFormComponentDefaultMemberJson} from "/apogeejs-app-lib/src/components/formInputComponentUtils.js";
import {defineHardcodedDataMember} from "/apogeejs-model-lib/src/apogeeModelLib.js";

import {getConfigViewModeEntry} from "/apogeejs-app-lib/src/components/FormInputBaseComponentView.js";
import ConfigurableFormEditor from "/apogeejs-app-lib/src/datadisplay/ConfigurableFormEditor.js";
import {ConfigurablePanel} from "/apogeejs-ui-lib/src/apogeeUiLib.js"
import VanillaViewModeElement from "/apogeejs-app-lib/src/datadisplay/VanillaViewModeElement.js";

const DATA_MEMBER_FUNCTION_BODY = `
if(formResult) return apogeeui.ConfigurablePanel.getGeneratedFormLayout(formResult);
else return [];
`

///////////////////////////////////////////////////////
// view code
////////////////////////////////////////////////////////


function getSourceState(component,oldSourceState) {

    let layoutMember = component.getField("data.member")

    if(layoutMember.getState() != apogeeutil.STATE_NORMAL) {
        //handle non-normal state - error, pending, invalid value
        if ( !oldSourceState || component.isStateUpdated() ) {
            return {
                hideDisplay: true,
                messageType: DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_INFO,
                message: "Form Layout unavailable"
            }
        }
        else {
            return oldSourceState
        }
        
    }
    else {
        //constructu source state - only layout data included here
        if( !oldSourceState || layoutMember.isFieldUpdated("data") ) {
            return {
                displayState: {layout: layoutMember.getData()},
                dataState: oldSourceState ? oldSourceState.dataState : {data: null}
            }
        }
        else {
            displayStateUpdated = false
        }
    }
}


/** This method returns the form layout.
 * @protected. */
 function getFormLayout(component) {
    let flags = {
        "inputExpressions": component.getField("allowInputExpressions")
    }
    return ConfigurablePanel.getFormDesignerLayout(flags);
}

//this defines the hardcoded type we will use
const dataMemberTypeName = "apogee.DesignerActionFormMember";
defineHardcodedDataMember(dataMemberTypeName,DATA_MEMBER_FUNCTION_BODY);
const DesignerActionFormComponentConfig = {
    displayName: "Action Form Cell",
    defaultMemberJson: getFormComponentDefaultMemberJson(dataMemberTypeName),
    defaultComponentJson: {
        type: "apogeeapp.DesignerActionFormCell",
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
        getConfigViewModeEntry(getFormLayout,"Form Designer")
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
export default DesignerActionFormComponentConfig;


