import Component from "/apogeejs-app-lib/src/component/Component.js";

/** This component represents a table object. */
class FunctionComponent extends Component {

    /** This overrides the get title method of member to return the function declaration. */
    getDisplayName(useFullPath,modelManagerForFullPathOnly) {
        var name = useFullPath ? this.getFullName(modelManagerForFullPathOnly) : this.getName();
        let member = this.getMember();
        var argList = member.getArgList();
        var argListString = argList.join(",");
        return name + "(" + argListString + ")";
    }

    /** This method returns true if the display name field is updated. This method exists because
     * display name is potentially a compound field and this is a systematic way to see if it has changed.
     * Components modifying the getDisplayName method should also update this method.
     * Note this method only applies when useFullPath = false. We currently don't implement a method to see
     * if the full name was updated. */
    isDisplayNameUpdated() {
        return this.getMember().areAnyFieldsUpdated(["name","argList"]);
    }
}

const FunctionComponentConfig = {
    componentClass: FunctionComponent,
	displayName: "Function Cell",
	defaultMemberJson: {
		"type": "apogee.FunctionMember"
	},
	defaultComponentJson: {
		type: "apogeeapp.FunctionCell"
	}
}
export default FunctionComponentConfig;

// memberPropertyList: [
//     "argList"
// ]
