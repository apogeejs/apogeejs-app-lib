import AceTextEditor from "/apogeejs-app-lib/src/datadisplay/AceTextEditor.js";
import {getErrorViewModeEntry,getFormulaViewModeEntry,getPrivateViewModeEntry} from "/apogeejs-app-lib/src/datasource/standardDataDisplay.js";
import VanillaViewModeElement from "/apogeejs-app-lib/src/datadisplay/VanillaViewModeElement.js";
import DATA_DISPLAY_CONSTANTS from "/apogeejs-app-lib/src/datadisplay/dataDisplayConstants.js";

/** This component is similar to the JsonComponent except that it
 * also supports function elements. When displaying them it replaces the function
 * element with the string value for that function.
 * This component only allows the standard JSON view and it also does not support manually
 * editing the value. The value must be returned from the formula.
 * This implementation is also inefficient. It is not intended for large data objects.
 */

///////////////////////////////////////////////////////
// view code
////////////////////////////////////////////////////////


function getDataDataDisplay() {
    return new AceTextEditor("ace/mode/json",AceTextEditor.OPTION_SET_DISPLAY_SOME)
}

function getPlusSourceState(component, oldSourceState) {

    let member = component.getMember()

    let dataState
    let dataStateUpdated


    if (!oldSourceState || member.isFieldUpdated("data")) {
        //normal data
        dataStateUpdated = true

        let data = member.getData()
        try {
            let jsonizedData = replaceFunctions(data)
            dataState = {
                data: apogeeutil.stringifyJsonData(jsonizedData)
            }
        }
        catch (error) {
            let sourceState = {}
            sourceState.dataState = { data: apogeeutil.INVALID_VALUE }
            sourceState.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_ERROR
            sourceState.message = "Error converting data to text: " + error.toString()
            return sourceState
        }
    }

    //source state
    if (dataStateUpdated) {
        return {
            dataState: dataState
        }
    }
    else {
        return oldSourceState
    }
}

function replaceFunctions(jsonPlus) {
    var copiedJson;

    var objectType = apogeeutil.getObjectType(jsonPlus);
    
    switch(objectType) {
        case "Object":
            copiedJson = replaceFunctionInObject(jsonPlus);
            break;
            
        case "Array": 
            copiedJson = replaceFunctionsInArray(jsonPlus);
            break;

        case "Function": 
            //copiedJson = FUNCTION_REPLACEMENT_STRING;
            copiedJson = jsonPlus.toString();
            break;
            
        default:
            copiedJson = jsonPlus;
    }
    
    return copiedJson;
}

function replaceFunctionInObject(jsonPlus) {
    var copiedJson = {};
    for(let key in jsonPlus) {
        copiedJson[key] = replaceFunctions(jsonPlus[key]);
    }
    return copiedJson;
}

function replaceFunctionsInArray(jsonPlus) {
    var copiedJson = [];
    for(var i = 0; i < jsonPlus.length; i++) {
        var element = jsonPlus[i];
        copiedJson.push(replaceFunctions(element));
    }
    return copiedJson;
}

//Config

const JsonPlusComponentConfig = {
	displayName: "Extended Data Cell",
	defaultMemberJson: {
		type: "apogee.DataMember"
	},
	defaultComponentJson: {
		type: "apogeeapp.ExtendedJsonCell"
	},

    viewModes: [
        getErrorViewModeEntry(),
        {
            name: "Data",
            label: "Data",
            sourceLayer: "model",
            sourceType: "data",
            isActive: true,
            getSourceState: (component,oldSourceState) => getPlusSourceState(component,oldSourceState),
            getViewModeElement: (sourceState,inEditMode,setEditModeData,verticalSize,cellShowing) => <VanillaViewModeElement
                displayState={sourceState.displayState}
                dataState={sourceState.dataState}
                hideDisplay={sourceState.hideDisplay}
                save={sourceState.save}
                inEditMode={inEditMode}
                setEditModeData={setEditModeData}
                verticalSize={verticalSize}
				cellShowing={cellShowing}
                getDataDisplay={displayState => getDataDataDisplay(displayState)} />,
            sizeCommandInfo: AceTextEditor.SIZE_COMMAND_INFO,
        },
        getFormulaViewModeEntry("member"),
        getPrivateViewModeEntry("member")
    ],
    iconResPath: "/icons3/jsonCellIcon.png"
}
export default JsonPlusComponentConfig;