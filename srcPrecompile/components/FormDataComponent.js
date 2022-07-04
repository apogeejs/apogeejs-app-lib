import ConfigurableFormEditor from "/apogeejs-app-lib/src/datadisplay/ConfigurableFormEditor.js";
import {Messenger} from "/apogeejs-model-lib/src/apogeeModelLib.js";
import {getErrorViewModeEntry,getFormulaViewModeEntry,getPrivateViewModeEntry,getMemberDataTextViewModeEntry} from "/apogeejs-app-lib/src/datasource/standardDataDisplay.js";
import dataDisplayHelper from "/apogeejs-app-lib/src/datadisplay/dataDisplayHelper.js";
import VanillaViewModeElement from "/apogeejs-app-lib/src/datadisplay/VanillaViewModeElement.js";

/** This ccomponent represents a data value, with input being from a configurable form.
 * This is an example of componound component. The data associated with the form
 * can be accessed from the variables (componentName).data. There are also subtables
 * "layout" which contains the form layout and "isInputValid" which is a function
 * to validate form input.
 * If you want a form to take an action on submit rather than create and edit a 
 * data value, you can use the dynmaic form. */

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
        //handle normal state
        let displayStateUpdated, dataStateUpdated, saveFunctionUpdated
        let displayState, dataState, saveFunction

        //display state
        if( !oldSourceState || component.isMemberDataUpdated("layout.member") ) {
            displayStateUpdated = true

            let layoutMember = component.getField("layout.member")
            displayState = {layout: layoutMember.getData()}
        }

        //data state
        if( !oldSourceState || component.isMemberDataUpdated("data.member") ) {
            dataStateUpdated = true

            let dataMember = component.getField("data.member")
            dataState = {
                data: dataMember.getData(),
                editOk: true
            }
        }

        //save function
        if( !oldSourceState || component.isMemberDataUpdated("isInputValid.member") ) {
            saveFunctionUpdated = true

            let isInputValidFunctionMember = component.getField("isInputValid.member")
            let isInputValid = isInputValidFunctionMember.getData();

            let runContextLink = component.getApp().getWorkspaceManager().getRunContextLink();
            let layoutMember = component.getField("layout.member");
            let messenger = new Messenger(runContextLink,layoutMember.getId());

            saveFunction = formValue => {
                
                let validateResult;
                if(isInputValid instanceof Function) {
                    try {
                        validateResult = isInputValid(formValue);
                    }
                    catch(error) {
                        validateResult = "Error running input validation function.";
                        console.error("Error reading form layout: " + component.getName());
                    }
                }
                else {
                    validateResult = "Input validate function not valid";
                }

                if(validateResult !== true) {
                    if(typeof validateResult != 'string') {
                        validateResult = "Improper format for isInputValid function. It should return true or an error message";
                    }
                    apogeeUserAlert(validateResult);
                    return false;
                }

                //save the data - send via messenger to the variable named "data" in code, which is the field 
                //named "data.member", NOT the field named "data"
                messenger.dataUpdate("data",formValue);
                return true;
            }
        }

        if( displayStateUpdated || dataStateUpdated || saveFunctionUpdated ) {
            return {
                displayState: displayStateUpdated ? displayState : oldSourceState.displayState,
                dataState: dataStateUpdated ? dataState : oldSourceState.dataState,
                save: saveFunctionUpdated ? saveFunction : oldSourceState.save,
            }
        }
        else {
            return oldSourceState
        }

    }
}


//Config


const FormDataComponentConfig = {
	displayName: "Simple Data Form Cell",
	defaultMemberJson: {
		"type": "apogee.Folder",
		"childrenNotWriteable": true,
		"children": {
			"layout": {
				"name": "layout",
				"type": "apogee.DataMember"
			},
			"data": {
				"name": "data",
				"type": "apogee.DataMember",
				"fields": {
					"data": ""
				}
			},
			"isInputValid": {
				"name": "isInputValid",
				"type": "apogee.FunctionMember",
				"fields": {
					"argList": [
						"formValue"
					],
					"functionBody": "//If data valid, return true. If data is invalid, return an error message.\nreturn true;"
				}
			}
		}
	},
	defaultComponentJson: {
		type: "apogeeapp.DataFormCell"
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
        getFormulaViewModeEntry("layout.member",{name:"Layout Code",label:"Layout Code"}),
        getPrivateViewModeEntry("layout.member",{name:"Layout Private",label:"Layout Private"}),
        getFormulaViewModeEntry("isInputValid.member",{name:"isInputValid(formValue)",label:"isInputValid",argList: "formValue"}),
        getPrivateViewModeEntry("isInputValid.member",{name:"isInputValid Private",label:"isInputValid Private"}),
        getMemberDataTextViewModeEntry("data.member",{name: "Form Value",label: "Form Value"})
    ],
    iconResPath: "/icons3/formCellIcon.png"
}
export default FormDataComponentConfig;