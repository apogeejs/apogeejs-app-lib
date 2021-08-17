import Component from "/apogeejs-app-lib/src/component/Component.js";

const DynamicFormConfig = {
	componentClass: Component,
	displayName: "Legacy Action Form Cell (deprecated)",
	defaultMemberJson: {
		"type": "apogee.FunctionMember",
		"fields": {
			"argList": [
				"admin"
			]
		}
	},
	defaultComponentJson: {
		type: "apogeeapp.ActionFormCell"
	}
}
export default DynamicFormConfig;