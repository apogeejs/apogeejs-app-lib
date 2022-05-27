import Component from "/apogeejs-app-lib/src/component/Component.js";

import AceTextEditor from "/apogeejs-app-lib/src/datadisplay/AceTextEditor.js";
import HandsonGridEditor from "/apogeejs-app-lib/src/datadisplay/HandsonGridEditor.js";
import dataDisplayHelper from "/apogeejs-app-lib/src/datadisplay/dataDisplayHelper.js";
import {getErrorViewModeEntry,getFormulaViewModeEntry,getPrivateViewModeEntry} from "/apogeejs-app-lib/src/datasource/standardDataDisplay.js";

///////////////////////////////////////////////////////
// view code
////////////////////////////////////////////////////////

function getDataViewDisplay(component) {
    let dataDisplaySource;
    let dataView = component.getField("dataView");
    //update the display container state bar
    //ADD THIS AGAIN
    //_setDisplayContainerStatus(displayContainer,dataView);
    switch(dataView) {
        case COLORIZED_DATA_VEW:
        default:
            dataDisplaySource = _wrapSourceForViewChange(dataDisplayHelper.getMemberDataTextDataSource("member"));
            return new AceTextEditor(dataDisplaySource,"ace/mode/json",AceTextEditor.OPTION_SET_DISPLAY_SOME);
            
        case TEXT_DATA_VEW:
            dataDisplaySource =_wrapSourceForViewChange(dataDisplayHelper.getMemberDataJsonDataSource("member"));
            return new AceTextEditor(dataDisplaySource,"ace/mode/text",AceTextEditor.OPTION_SET_DISPLAY_MAX);
            
        case GRID_DATA_VEW:
            dataDisplaySource = _wrapSourceForViewChange(dataDisplayHelper.getMemberDataJsonDataSource("member"));
            return new HandsonGridEditor(dataDisplaySource);
    }
}

/** This method updates the data display source to account for reloading the data display due to 
 * a change in the data view. */
function _wrapSourceForViewChange(dataDisplaySource) {
    let originalDoUpdate = dataDisplaySource.doUpdate;
    dataDisplaySource.doUpdate = (component) => {
        let returnValue = originalDoUpdate(component)
        returnValue.reloadDataDisplay = component.isFieldUpdated("dataView")
        return returnValue;
    }
    return dataDisplaySource;
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
    componentClass: Component,
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
            getDataDisplay: (component) => getDataViewDisplay(component)
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





