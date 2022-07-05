import ConfigurableFormEditor from "/apogeejs-app-lib/src/datadisplay/ConfigurableFormEditor.js"
import {getErrorViewModeEntry,getFormulaViewModeEntry,getPrivateViewModeEntry} from "/apogeejs-app-lib/src/datasource/standardDataDisplay.js"
import VanillaViewModeElement from "/apogeejs-app-lib/src/datadisplay/VanillaViewModeElement.js"
import dataDisplayHelper from "/apogeejs-app-lib/src/datadisplay/dataDisplayHelper.js"

///////////////////////////////////////////////////////
// view code
////////////////////////////////////////////////////////

function getSourceState(component,oldSourceState) {

    if(component.getState() != apogeeutil.STATE_NORMAL) {
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
        //normal state - only display data here
        if( !oldSourceState || component.isMemberDataUpdated("member") ) {
            let member = component.getField("member")
            return {
                displayState: {layout: member.getData()},
                dataState: {data: null}
            }
        }
        else {
            return oldSourceState
        }
    }
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