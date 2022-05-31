import Component from "/apogeejs-app-lib/src/component/Component.js";

import AceTextEditor from "/apogeejs-app-lib/src/datadisplay/AceTextEditor.js";
import dataDisplayHelper from "/apogeejs-app-lib/src/datadisplay/dataDisplayHelper.js";
import {getErrorViewModeEntry,getFormulaViewModeEntry,getPrivateViewModeEntry} from "/apogeejs-app-lib/src/datasource/standardDataDisplay.js";
import VanillaViewModeElement from "/apogeejs-app-lib/src/datadisplay/VanillaViewModeElement.js";

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
    let dataDisplaySource = getDataSource();
    return new AceTextEditor(dataDisplaySource,"ace/mode/json",AceTextEditor.OPTION_SET_DISPLAY_SOME);
}


/** This data source is read only (no edit). It returns text for a json */
function getDataSource() {

    return {
        doUpdate: (component) => {
            //return value is whether or not the data display needs to be udpated
            let reloadData = component.isMemberDataUpdated("member");
            let reloadDataDisplay = false;
            return {reloadData,reloadDataDisplay};
        },

        getData: (component) => {
            let wrappedData = dataDisplayHelper.getWrappedMemberData(component,"member")
            //if we have valid data, update it to display the functions with the otherwise JSON data.
            if(wrappedData.data != apogeeutil.INVALID_VALUE) {
                var textData;
                if(wrappedData.data === undefined) {
                    textData = "undefined";
                }
                else {
                    let modifiedValueJson = replaceFunctions(wrappedData.data);
                    textData = JSON.stringify(modifiedValueJson,null,FORMAT_STRING);
                }

                wrappedData.data = textData;
            }
        }
    }
}




const FORMAT_STRING = "\t";

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
	componentClass: Component,
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
            getViewModeElement: (component,showing,size) => <VanillaViewModeElement
				component={component}
				getDataDisplay={getDataDataDisplay}
				showing={showing}
                size={size} />,
            sizeCommandInfo: AceTextEditor.SIZE_COMMAND_INFO,
        },
        getFormulaViewModeEntry("member"),
        getPrivateViewModeEntry("member")
    ],
    iconResPath: "/icons3/jsonCellIcon.png"
}
export default JsonPlusComponentConfig;