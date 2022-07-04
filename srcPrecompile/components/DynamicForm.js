import ConfigurableFormEditor from "/apogeejs-app-lib/src/datadisplay/ConfigurableFormEditor.js"
import {getErrorViewModeEntry,getFormulaViewModeEntry,getPrivateViewModeEntry} from "/apogeejs-app-lib/src/datasource/standardDataDisplay.js"
import VanillaViewModeElement from "/apogeejs-app-lib/src/datadisplay/VanillaViewModeElement.js"
import dataDisplayHelper from "/apogeejs-app-lib/src/datadisplay/dataDisplayHelper.js"

///////////////////////////////////////////////////////
// view code
////////////////////////////////////////////////////////

function getSourceState(component,oldSourceState) {

    let sourceState
    const memberFieldName = "member"
    if( (!oldSourceState) || (component.isMemberDataUpdated(memberFieldName)) ) {
        //this call loads the source state, but we want the data output in the displayState field
        sourceState = {}
        let member = component.getField(memberFieldName)
        if(member.getState() != apogeeutil.STATE_NORMAL) {
            sourceState.dataState = {data: apogeeutil.INVALID_VALUE}
            sourceState.hideDisplay = true
            sourceState.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_INFO
            sourceState.message = "Data Unavailable"
        }
        else {
            sourceState.displayState = {layout: member.getData()}
            sourceState.dataState = oldSourceState ? oldSourceState.dataState : {data:null}
            sourceState.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_NONE
        }
    }
    else {
        sourcestate = oldSourceState
    }

    return sourceState
}

//Cnfig

const DynamicFormConfig = {
	displayName: "Simple Action Form Cell",
	defaultMemberJson: {
		"type": "apogee.DataMember"
	},
	defaultComponentJson: {
		type: "apogeeapp.ActionFormCell"
	},

    viewModes: [
        getErrorViewModeEntry(),
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
        getFormulaViewModeEntry("member",{name:"Input Code",label:"Layout Code",argList:""}),
        getPrivateViewModeEntry("member",{name:"Input Private",label:"Layout Private"}),
    ],
    iconResPath: "/icons3/formCellIcon.png"
}
export default DynamicFormConfig;