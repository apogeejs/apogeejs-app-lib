import AceTextEditor from "/apogeejs-app-lib/src/datadisplay/AceTextEditor.js";
import HandsonGridEditor from "/apogeejs-app-lib/src/datadisplay/HandsonGridEditor.js";
import {getStringifiedJsonDataSourceState,getJsonDataSourceState} from "/apogeejs-app-lib/src/datasource/standardDataDisplay.js";
import {getErrorViewModeEntry,getFormulaViewModeEntry,getPrivateViewModeEntry} from "/apogeejs-app-lib/src/datasource/standardDataDisplay.js";
import VanillaViewModeElement from "/apogeejs-app-lib/src/datadisplay/VanillaViewModeElement.js";

///////////////////////////////////////////////////////
// view code
////////////////////////////////////////////////////////

function getDataViewDisplay(displayState) {
    let dataView = displayState ? displayState.dataView : ""
    switch(dataView) {
        case COLORIZED_DATA_VEW:
        default:
            return new AceTextEditor("ace/mode/json",AceTextEditor.OPTION_SET_DISPLAY_SOME);
            
        case TEXT_DATA_VEW:
            return new AceTextEditor("ace/mode/text",AceTextEditor.OPTION_SET_DISPLAY_SOME);
            
        case GRID_DATA_VEW:
            return new HandsonGridEditor();
    }
}

/** This function returns true if the data passed in is a string. */
function _isText(data) {
    return apogeeutil.isString(data)
}

/** This returns true if the data passed in is an array of arrays */
function _isGrid(data) {
    if(Array.isArray(data)) {
        return (data.length > 0)&&(data.every(entry => Array.isArray(entry)))
    }
    else {
        return false
    }
}

function getSourceState(component,oldSourceState) {

    let dataView = component.getField("dataView")
    let memberFieldName = "member"

    //reset state if the data view changes
    if( oldSourceState && (dataView != oldSourceState.displayState.dataView) ) {
        oldSourceState = null
    }

    let baseSourceState, sourceState
    switch(dataView) {
        case COLORIZED_DATA_VEW:
        default:
            baseSourceState = getStringifiedJsonDataSourceState(component,memberFieldName,oldSourceState)
            break
            
        case TEXT_DATA_VEW:
            baseSourceState = getJsonDataSourceState(component,memberFieldName,oldSourceState,false,_isText,"Data value is not text!")
            break
            
        case GRID_DATA_VEW:
            baseSourceState = getJsonDataSourceState(component,memberFieldName,oldSourceState,false,_isGrid,"Data value is not an array of arrays!")
            break
    }

    //update data view variable (display state and status state)
    if(oldSourceState && (oldSourceState.displayState.dataView == dataView)) {
        //no change to data view

        if(baseSourceState == oldSourceState) {
            //we just keep the old source state
            sourceState = oldSourceState
        }
        else {
            //we hav a new base source state - copy the old display and status state to it.
            sourceState = baseSourceState
            sourceState.displayState = oldSourceState.displayState
            sourceState.statusState = oldSourceState.statusState
        }
    }
    else {
        //new data view
        if(baseSourceState == oldSourceState) {
            //we have the old source state, but we must reassign the display and status states
            sourceState = {}
            Object.assign(sourceState,oldSourceState)
        }
        else {
            //we have a new base source state - copy the old display and status state to it.
            sourceState = baseSourceState
        }

        sourceState.displayState = {dataView: dataView}
        sourceState.statusState = {dataView: dataView}
    }

    return sourceState
}


// function _setDisplayContainerStatus(displayContainer,dataView) {
//     let displayBarElement = displayContainer.getDisplayBarElement();
//     if(displayBarElement) {
//         uiutil.removeAllChildren(displayBarElement);
//         let statusElement = document.createElement("span");
//         statusElement.innerHTML = "Display Format: " + VIEW_DISPLAY_NAMES[dataView];
//         statusElement.style.fontSize = "smaller";
//         statusElement.style.color = "gray";
//         statusElement.style.marginLeft = "20px";
//         statusElement.style.userSelect ; "none";
//         statusElement.className = "visiui_hideSelection";
//         displayBarElement.appendChild(statusElement);
//     }
// }

//===============================
// Internal Settings
//===============================

const COLORIZED_DATA_VEW = "Colorized";
const TEXT_DATA_VEW = "Text Data";
const GRID_DATA_VEW = "Grid";

let VIEW_DISPLAY_NAMES = {};
VIEW_DISPLAY_NAMES[COLORIZED_DATA_VEW] = "JSON";
VIEW_DISPLAY_NAMES[TEXT_DATA_VEW] = "Plain Text";
VIEW_DISPLAY_NAMES[GRID_DATA_VEW] = "Grid";


const JsonComponentConfig = {
    displayName: "Data Cell",
    defaultMemberJson: {
        "type": "apogee.DataMember"
    },
    defaultComponentJson: {
        type: "apogeeapp.JsonCell",
        fields: {
            dataView: "Colorized"
        }
    },

    viewModes: [
        getErrorViewModeEntry(),
        {
            name: "Data",
            label: "Data",
            sourceLayer: "model",
            sourceType: "data",
            suffix: "",
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
                getDataDisplay={displayState => getDataViewDisplay(displayState)} />,
            getViewStatusElement: (statusState) => <DataViewStatusElement statusState={statusState} />,
            sizeCommandData: AceTextEditor.SIZE_COMMAND_INFO
        },
        getFormulaViewModeEntry("member"),
        getPrivateViewModeEntry("member")  
    ],
    iconResPath: "/icons3/jsonCellIcon.png",
    propertyDialogEntries: [
        {
            propertyKey: "dataView",
            dialogElement: {
                "type":"dropdown",
                "label":"Data Display Format: ",
                "entries":[
                    [ VIEW_DISPLAY_NAMES[COLORIZED_DATA_VEW] , COLORIZED_DATA_VEW ],
                    [ VIEW_DISPLAY_NAMES[TEXT_DATA_VEW] , TEXT_DATA_VEW ],
                    [ VIEW_DISPLAY_NAMES[GRID_DATA_VEW] , GRID_DATA_VEW ]
                ],
                "key":"dataView"
            }
        }
    ]
}
export default JsonComponentConfig;


function DataViewStatusElement({statusState}) {
    let dataView = statusState ? statusState.dataView : "Error - not read!"
    let style = {
        "fontSize": "smaller",
        "color": "gray",
        "marginLeft": "20px"
    }
    return <span className="visiui_hideSelection" style={style}>Display Format: {dataView}</span>
}

