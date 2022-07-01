import AceTextEditor from "/apogeejs-app-lib/src/datadisplay/AceTextEditor.js";
import HandsonGridEditor from "/apogeejs-app-lib/src/datadisplay/HandsonGridEditor.js";
import dataDisplayHelper from "/apogeejs-app-lib/src/datadisplay/dataDisplayHelper.js";
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
            return new AceTextEditor("ace/mode/text",AceTextEditor.OPTION_SET_DISPLAY_MAX);
            
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

    //value
    let sourceState = {}
    let member = component.getMember()
    let editOk = !member.hasCode()

    if( (!oldSourceState) || (component.isMemberDataUpdated(memberFieldName)) || (dataView != oldSourceState.displayState.dataView) ) {
        switch(dataView) {
            case COLORIZED_DATA_VEW:
            default:
                dataDisplayHelper.loadStringifiedJsonSourceState(component,memberFieldName,sourceState,editOk)
                break
                
            case TEXT_DATA_VEW:
                dataDisplayHelper.loadFormattedJsonSourceState(component,memberFieldName,sourceState,editOk,_isText,"Data value is not text!")
                break
                
            case GRID_DATA_VEW:
                dataDisplayHelper.loadFormattedJsonSourceState(component,memberFieldName,sourceState,editOk,_isGrid,"Data value is not an array of arrays!")
                break
        }

        //pass the date view to the display element and the status element
        sourceState.displayState = oldSourceState && (oldSourceState.displayState.dataView == dataView) ? oldSourceState.displayState : {dataView: dataView}
        sourceState.statusState = oldSourceState && (oldSourceState.statusState.dataView == dataView) ? oldSourceState.statusState : {dataView: dataView}
    }
    else {
        dataState = oldDataState
    }

    //save
    
    if(editOk) {
        switch(dataView) {
            case COLORIZED_DATA_VEW:
            default:
                sourceState.save = dataDisplayHelper.getMemberTextToJsonSaveFunction(component,memberFieldName)
                break
                
            case TEXT_DATA_VEW:
                sourceState.save = dataDisplayHelper.getMemberJsonToJsonSaveFunction(component,memberFieldName)
                break
                
            case GRID_DATA_VEW:
                sourceState.save = dataDisplayHelper.getMemberJsonToJsonSaveFunction(component,memberFieldName)
                break
        }
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
            getViewModeElement: (displayState,dataState,hideDisplay,cellShowing,setEditModeData,size) => <VanillaViewModeElement
                displayState={displayState}
                dataState={dataState}
                hideDisplay={hideDisplay}
				getDataDisplay={displayState => getDataViewDisplay(displayState)}
                setEditModeData={setEditModeData}
				cellShowing={cellShowing} 
                size={size} />,
            getViewStatusElement: (statusState) => <DataViewStatusElement statusState={statusState} />,
            sizeCommandInfo: AceTextEditor.SIZE_COMMAND_INFO
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

