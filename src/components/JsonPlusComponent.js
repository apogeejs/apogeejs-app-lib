import Component from "/apogeejs-app-lib/src/component/Component.js";

/** This component is similar to the JsonComponent except that it
 * also supports function elements. When displaying them it replaces the function
 * element with the string value for that function.
 * This component only allows the standard JSON view and it also does not support manually
 * editing the value. The value must be returned from the formula.
 * This implementation is also inefficient. It is not intended for large data objects.
 */

const JsonPlusComponentConfig = {
	componentClass: Component,
	displayName: "Extended Data Cell",
	defaultMemberJson: {
		type: "apogee.DataMember"
	},
	defaultComponentJson: {
		type: "apogeeapp.ExtendedJsonCell"
	}
}
export default JsonPlusComponentConfig;