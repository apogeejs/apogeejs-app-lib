import Component from "/apogeejs-app-lib/src/component/Component.js";

/** This component represents a table object. */
export default class DynamicForm extends Component {}

//======================================
// This is the component generator, to register the component
//======================================

DynamicForm.CLASS_CONFIG = {
	displayName: "Legacy Action Form Cell (deprecated)",
	uniqueName: "apogeeapp.ActionFormCell",
	defaultMemberJson: {
		"type": "apogee.FunctionMember",
		"updateData": {
			"argList": [
				"admin"
			]
		}
	}
}