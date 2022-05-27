import Component from "/apogeejs-app-lib/src/component/Component.js";

import ConfigurableFormEditor from "/apogeejs-app-lib/src/datadisplay/ConfigurableFormEditor.js";
import dataDisplayHelper from "/apogeejs-app-lib/src/datadisplay/dataDisplayHelper.js";
import DATA_DISPLAY_CONSTANTS from "/apogeejs-app-lib/src/datadisplay/dataDisplayConstants.js";
import {Messenger} from "/apogeejs-model-lib/src/apogeeModelLib.js";
import {getErrorViewModeEntry,getAppCodeViewModeEntry,getFormulaViewModeEntry,getPrivateViewModeEntry} from "/apogeejs-app-lib/src/datasource/standardDataDisplay.js";
import apogeeutil from "/apogeejs-util-lib/src/apogeeUtilLib.js";
import VanillaViewModeElement from "/apogeejs-app-lib/src/datadisplay/VanillaViewModeElement.js";


/** This updates the layout function when the layout code is updated. */
function onLayoutCodeUpdate(component,layoutCode) {
    let layoutFunctionFieldValue;
    if((layoutCode === undefined)&&(layoutCode === null)) layoutCode = "";

    try {
        //create the validator function
        layoutFunctionFieldValue = new Function("commandMessenger","inputData",layoutCode);
    }
    catch(error) {
        if(error.stack) console.error(error.stack);
        layoutFunctionFieldValue = error;
    }

    component.setField("layoutFunction",layoutFunctionFieldValue);
}

///////////////////////////////////////////////////////
// view code
////////////////////////////////////////////////////////

function getFormViewDisplay() {
    let dataDisplaySource = getOutputDataDisplaySource();
    return new ConfigurableFormEditor(dataDisplaySource);
}

function getOutputDataDisplaySource() {
    return {

        //This method reloads the component and checks if there is a DATA update. UI update is checked later.
        doUpdate: (component) => {
            let reloadData = false;
            let reloadDataDisplay = component.isFieldUpdated("layoutFunction") || component.isMemberDataUpdated("member");
            return {reloadData,reloadDataDisplay};
        },

        getDisplayData: (component) => {       
            //get the layout function
            let layoutFunction = component.getField("layoutFunction");
            if(layoutFunction instanceof Error) {
                let wrappedData = {};
                wrappedData.displayInvalid = true;
                wrappedData.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_ERROR;
                wrappedData.message = "Error in layout function: " + layoutFunction.toString();
                return wrappedData;
            }

            //load the layout
            //read the input data (checking for non-normal state)
            let wrappedData = dataDisplayHelper.getWrappedMemberData(component,"member");

            //use the parent folder as the scope base
            if(wrappedData.data != apogeeutil.INVALID_VALUE) {
                let runContextLink = component.getApp().getWorkspaceManager().getRunContextLink();
                let inputData = wrappedData.data;
                let scopeMemberId = component.getMember().getParentId();
                let messenger = new Messenger(runContextLink,scopeMemberId);
                try {
                    let layout = layoutFunction(messenger,inputData);
                    wrappedData.data = layout;
                }
                catch(error) {
                    let errorWrappedData = {};
                    errorWrappedData.hideDisplay = true;
                    errorWrappedData.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_ERROR;
                    errorWrappedData.message = "Error executing layout function: " + error.toString();
                    return errorWrappedData;
                }
            }

            return wrappedData;
        },

        //no data
        getData: (component) => { return {"data": null}; }
    }
}


//Config

const FullActionFormComponentConfig = {
    componentClass: Component,
	displayName: "Full Action Form Cell",
	defaultMemberJson: {
		"type": "apogee.DataMember"
	},
    defaultComponentJson: {
        type: "apogeeapp.FullActionFormCell",
        fields: {
            "layoutCode": "return [];"
        }
    },
    fieldFunctions: {
		layoutCode: {
			fieldChangeHandler: onLayoutCodeUpdate 
		}
	},

    viewModes: [
        getErrorViewModeEntry(),
        {
            name: "form",
            label: "Form",
            isActive: true,
            getViewModeElement: (component,showing) => <VanillaViewModeElement
				component={component}
				getDataDisplay={getFormViewDisplay}
				showing={showing} />
        },
        getAppCodeViewModeEntry("layoutCode",null,"layout","Layout Code",{argList:"commandMessenger,inputData",isActive: true}),
        getFormulaViewModeEntry("member",{name: "input", label:"Input Data Code"}),
        getPrivateViewModeEntry("member",{name: "inputPrivate", label:"Input Data Private"})
    ],
    iconResPath: "/icons3/formCellIcon.png"
}
export default FullActionFormComponentConfig;




