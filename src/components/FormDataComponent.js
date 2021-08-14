import Component from "/apogeejs-app-lib/src/component/Component.js";

/** This ccomponent represents a data value, with input being from a configurable form.
 * This is an example of componound component. The data associated with the form
 * can be accessed from the variables (componentName).data. There are also subtables
 * "layout" which contains the form layout and "isInputValid" which is a function
 * to validate form input.
 * If you want a form to take an action on submit rather than create and edit a 
 * data value, you can use the dynmaic form. */
export default class FormDataComponent extends Component {}

//======================================
// This is the component generator, to register the component
//======================================

FormDataComponent.CLASS_CONFIG = {
	displayName: "Legacy Data Form Cell (deprecated)",
	defaultMemberJson: {
		"type": "apogee.Folder",
		"childrenNotWriteable": true,
		"children": {
			"layout": {
				"name": "layout",
				"type": "apogee.FunctionMember",
				"fields": {
					"argList": []
				}
			},
			"data": {
				"name": "data",
				"type": "apogee.JsonMember",
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
	}
}