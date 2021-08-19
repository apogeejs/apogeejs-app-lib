import Component from "/apogeejs-app-lib/src/component/Component.js";

/** This component represents a json table object. */
class ErrorComponent extends Component {

    /** This overrides the save method to return the original input. */
    toJson(modelManager) {
        return this.getField("completeJson");
    }

    /** This overrides the open deserialize method to save the entire json. */
    loadFromJson(json,modelManager) {
        this.setField("completeJson",json);
    }
}


const ErrorComponentConfig = {
    componentClass: ErrorComponent,
	displayName: "Error Cell",
	defaultMemberJson: {
		type: "apogee.ErrorMember"
	},
	defaultComponentJson: {
		type: "apogeeapp.ErrorCell"
	}
}
export default ErrorComponentConfig;

