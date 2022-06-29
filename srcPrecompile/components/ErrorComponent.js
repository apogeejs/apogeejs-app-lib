import Component from "/apogeejs-app-lib/src/component/Component.js";


/** This component represents a error member object. */
export class ErrorComponent extends Component {

    /** This overrides the save method to return the original input. */
    toJson(modelManager) {
        return this.getField("completeJson");
    }

    /** This overrides the open deserialize method to save the entire json. */
    loadFromJson(json,modelManager) {
        this.setField("completeJson",json);
    }
}

export const ErrorComponentConfig = {
	displayName: "Error Cell",
	defaultMemberJson: {
		type: "apogee.ErrorMember"
	},
	defaultComponentJson: {
		type: "apogeeapp.ErrorCell"
	},

    viewModes: [
        {
            name: "ComponentError",
            label: "Component Error",
            isActive: true,
            getViewModeElement: (component,showing) => <div style={{"color":"red", "font-weight":"bold"}}>ERROR - Component not loaded!</div>
        }
    ],
    iconResPath: "/icons3/errorCellIcon.png"
}

