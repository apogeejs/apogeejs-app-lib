import Component from "/apogeejs-app-lib/src/component/Component.js";

import ConfigurableFormEditor from "/apogeejs-app-lib/src/datadisplay/ConfigurableFormEditor.js";
import dataDisplayHelper from "/apogeejs-app-lib/src/datadisplay/dataDisplayHelper.js";
import DATA_DISPLAY_CONSTANTS from "/apogeejs-app-lib/src/datadisplay/dataDisplayConstants.js";
import {Messenger} from "/apogeejs-model-lib/src/apogeeModelLib.js";
import {getErrorViewModeEntry,getAppCodeViewModeEntry,getFormulaViewModeEntry,getPrivateViewModeEntry,getMemberDataTextViewModeEntry} from "/apogeejs-app-lib/src/datasource/standardDataDisplay.js";
import apogeeutil from "/apogeejs-util-lib/src/apogeeUtilLib.js";

//-----------------------
// Handlers for field changes, to update linked fields
//-----------------------

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

/** This updates the validator function when the validator code is updated. */
function onValidatorCodeUpdate(component,validatorCode) {
    let validatorFunctionFieldValue;
    if((validatorCode === undefined)&&(validatorCode === null)) validatorCode = "";
    
    try {
        //create the validator function
        validatorFunctionFieldValue = new Function("formValue","inputData",validatorCode);
    }
    catch(error) {
        if(error.stack) console.error(error.stack);
        validatorFunctionFieldValue = error;
    }

    component.setField("validatorFunction",validatorFunctionFieldValue);
}

///////////////////////////////////////////////////////
// view code
////////////////////////////////////////////////////////


function getFormViewDisplay(componentHolder) {
    let dataDisplaySource = getOutputDataDisplaySource(componentHolder);
    return new ConfigurableFormEditor(dataDisplaySource);
}

function getOutputDataDisplaySource(componentHolder) {
    return {
        //NEED TO FACTOR IN INPUT VALUE!!!

        //This method reloads the component and checks if there is a DATA update. UI update is checked later.
        doUpdate: () => {
            let component = componentHolder.getComponent()
            let reloadData = component.isMemberDataUpdated("member.value");
            let reloadDataDisplay = component.isFieldUpdated("layoutFunction") || component.isMemberFieldUpdated("member.input","data");
            return {reloadData,reloadDataDisplay};
        },

        getDisplayData: () => {       
            //get the layout function
            let component = componentHolder.getComponent()
            let layoutFunction = component.getField("layoutFunction");
            if(layoutFunction instanceof Error) {
                let wrappedData = {};
                wrappedData.displayInvalid = true;
                wrappedData.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_ERROR;
                wrappedData.message = "Error in layout function: " + layoutFunction.toString();
                return wrappedData;
            }

            //load the layout
            let wrappedData = dataDisplayHelper.getWrappedMemberData(component,"member.input");

            //use the parent folder as the scope base
            if(wrappedData.data != apogeeutil.INVALID_VALUE) {
                let runContextLink = component.getApp().getWorkspaceManager().getRunContextLink();
                let scopeMemberId = component.getMember().getParentId();
                let messenger = new Messenger(runContextLink,scopeMemberId);
                try {
                    let layout = layoutFunction(messenger,wrappedData.data);
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

        getData: () => dataDisplayHelper.getWrappedMemberData(componentHolder.getComponent(),"member.value"),

        getEditOk: () => true,

        saveData: (formValue) => {
            let component = componentHolder.getComponent()

            //below this data is valid only for normal state input. That should be ok since this is save.
            let inputData = component.getField("member.input").getData();

            try {
                let isDataValidFunction = component.getField("validatorFunction");
                if(isDataValidFunction instanceof Error) {
                    //this is clumsy - we need to show the user somewhere that there is an error
                    //maybe in the code?
                    apogeeUserAlert("Error in validator function! Input could not be processed!");
                    return false;
                }

                let isValidResult = isDataValidFunction(formValue,inputData);
                if(isValidResult === true) {
                    //save data
                    let runContextLink = component.getApp().getWorkspaceManager().getRunContextLink();
                    let memberId = component.getMemberId();
                    let messenger = new Messenger(runContextLink,memberId);
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
}



const FullDataFormComponentConfig = {
    componentClass: Component,
	displayName: "Full Data Form Cell",
	defaultMemberJson: {
		"type": "apogee.Folder",
		"childrenNotWriteable": true,
		"children": {
			"input": {
				"name": "input",
				"type": "apogee.DataMember",
				"fields": {
					"data": ""
				}
			},
			"value": {
				"name": "value",
				"type": "apogee.DataMember",
				"fields": {
					"data": ""
				}
			}
		}
	},
    defaultComponentJson: {
        type: "apogeeapp.FullDataFormCell",
        fields: {
            layoutCode: "return [];",
            validatorCode: "return true;"
        }
    },
    fieldFunctions: {
		layoutCode: {
			fieldChangeHandler: onLayoutCodeUpdate 
		},
        validatorCode: {
			fieldChangeHandler: onValidatorCodeUpdate 
		}
	},

    viewModes: [
        getErrorViewModeEntry(),
        {
            name: "Form",
            label: "Form",
            sourceLayer: "model",
            sourceType: "data",
            suffix: ".value", 
            isActive: true,
            getDataDisplay: (componentHolder) => getFormViewDisplay(componentHolder)
        },
        getAppCodeViewModeEntry("layoutCode","layoutFunction","layout","Layout Code",{argList:"commandMessenger,inputData",isActive: true}),
        getAppCodeViewModeEntry("validatorCode","validatorFunction","validator","Validator Code",{argList:"formValue,inputData"}),
        getFormulaViewModeEntry("member.input",{name: "input", label:"Input Data Code"}),
        getPrivateViewModeEntry("member.input",{name: "inputPrivate", label:"Input Data Private"}),
        getMemberDataTextViewModeEntry("member.value")
    ],
    iconResPath: "/icons3/formCellIcon.png"
}
export default FullDataFormComponentConfig;





