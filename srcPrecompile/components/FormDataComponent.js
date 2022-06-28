import Component from "/apogeejs-app-lib/src/component/Component.js";

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

function getFormViewDisplay(component) {
    let dataDisplaySource = getFormEditorCallbacks();
    return new ConfigurableFormEditor(component,dataDisplaySource);
}

function getFormEditorCallbacks() {

    var dataDisplaySource = {};
    dataDisplaySource.doUpdate = (component) => {
        //update depends on multiplefields
        let reloadData = component.isMemberDataUpdated("member.data");
        let reloadDataDisplay = ( (component.isMemberDataUpdated("member.layout")) ||
            (component.isMemberDataUpdated("member.isInputValid")) );
        return {reloadData,reloadDataDisplay};
    },

    //return form layout
    dataDisplaySource.getDisplayData = (component) => dataDisplayHelper.getWrappedMemberData(component,"member.layout"),
    
    //return desired form value
    dataDisplaySource.getData = (component) => dataDisplayHelper.getWrappedMemberData(component,"member.data");
    
    //edit ok - always true
    dataDisplaySource.getEditOk = (component) => {
        return true;
    }
    
    //save data - just form value here
    dataDisplaySource.saveData = (formValue,component) => {
        let isInputValidFunctionMember = component.getField("member.isInputValid");
        //validate input
        var isInputValid = isInputValidFunctionMember.getData();
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
        //named "member.data", NOT the field named "data"
        let runContextLink = component.getApp().getWorkspaceManager().getRunContextLink();
        let layoutMember = component.getField("member.layout");
        let messenger = new Messenger(runContextLink,layoutMember.getId());
        messenger.dataUpdate("data",formValue);
        return true;
    }
    
    return dataDisplaySource;
}

//Config


const FormDataComponentConfig = {
	componentClass: Component,
	displayName: "Legacy Data Form Cell (deprecated)",
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
            getViewModeElement: (component,showing,setEditModeData,setMsgData,size,setSizeCommandData) => <VanillaViewModeElement
				component={component}
				getDataDisplay={getFormViewDisplay}
                setEditModeData={setEditModeData}
                setMsgData={setMsgData}
				showing={showing} 
                size={size}
                setSizeCommandData={setSizeCommandData} />
        },
        getFormulaViewModeEntry("member.layout",{name:"Layout Code",label:"Layout Code"}),
        getPrivateViewModeEntry("member.layout",{name:"Layout Private",label:"Layout Private"}),
        getFormulaViewModeEntry("member.isInputValid",{name:"isInputValid(formValue)",label:"isInputValid",argList: "formValue"}),
        getPrivateViewModeEntry("member.isInputValid",{name:"isInputValid Private",label:"isInputValid Private"}),
        getMemberDataTextViewModeEntry("member.data",{name: "Form Value",label: "Form Value"})
    ],
    iconResPath: "/icons3/formCellIcon.png"
}
export default FormDataComponentConfig;