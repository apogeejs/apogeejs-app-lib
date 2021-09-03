import Component from "/apogeejs-app-lib/src/component/Component.js";

/** This overrides the get title method of member to return the function declaration. */
function getDisplayName(component,standardDisplayName) {
    let member = component.getMember();
    var argList = member.getArgList();
    var argListString = argList.join(",");
    return standardDisplayName + "(" + argListString + ")";
}

/** This method returns true if the display name field is updated. This method exists because
 * display name is potentially a compound field and this is a systematic way to see if it has changed.
 * Components modifying the getDisplayName method should also update this method.
 * Note this method only applies when useFullPath = false. We currently don't implement a method to see
 * if the full name was updated. */
function isDisplayNameUpdated(component) {
    return component.getMember().areAnyFieldsUpdated(["name","argList"]);
}

const FunctionComponentConfig = {
    componentClass: Component,
	displayName: "Function Cell",
	defaultMemberJson: {
		"type": "apogee.FunctionMember"
	},
	defaultComponentJson: {
		type: "apogeeapp.FunctionCell"
	},
    instanceDisplayName: {
        getDisplayName: getDisplayName,
        isDisplayNameUpdated: isDisplayNameUpdated
    }
}
export default FunctionComponentConfig;

// memberPropertyList: [
//     "argList"
// ]
