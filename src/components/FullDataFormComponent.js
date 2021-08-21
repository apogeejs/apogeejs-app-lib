import Component from "/apogeejs-app-lib/src/component/Component.js";

/** This is a custom resource component. 
 * To implement it, the resource script must have the methods "run()" which will
 * be called when the component is updated. It also must have any methods that are
 * confugred with initialization data from the model. */
class FullDataFormComponent extends Component {

    constructor(member,modelManager,instanceToCopy,keepUpdatedFixed,componentConfig) {
        super(member,modelManager,instanceToCopy,keepUpdatedFixed,componentConfig);

        //Here we link function updates to when the code field is updated 
        this.addComponentFieldChangeHandler("layoutCode",layoutCode => this._onLayoutCodeUpdate(layoutCode))
        this.addComponentFieldChangeHandler("validatorCode",validatorCode => this._onValidatorCodeUpdate(validatorCode))
    }

    //-----------------------
    // Handlers for field changes, to update linked fields
    //-----------------------

    /** This updates the layout function when the layout code is updated. */
    _onLayoutCodeUpdate(layoutCode) {
        let layoutFunctionFieldValue;
        if((layoutCode === undefined)&&(layoutCode === null)) layoutCode = "";

        try {
            //create the validator function
            layoutFunctionFieldValue = new Function("commandMessenger","inputData",layoutCode);
        }
        catch(error) {
            if(error.stack) console.error(error.stack);
            layoutFunctionFieldValue = error;
        }

        this.setField("layoutFunction",layoutFunctionFieldValue);
    }

    /** This updates the validator function when the validator code is updated. */
    _onValidatorCodeUpdate(validatorCode) {
        let validatorFunctionFieldValue;
        if((validatorCode === undefined)&&(validatorCode === null)) validatorCode = "";
        
        try {
            //create the validator function
            validatorFunctionFieldValue = new Function("formValue","inputData",validatorCode);
        }
        catch(error) {
            if(error.stack) console.error(error.stack);
            validatorFunctionFieldValue = error;
        }

        this.setField("validatorFunction",validatorFunctionFieldValue);
    }


}

const FullDataFormComponentConfig = {
    componentClass: FullDataFormComponent,
	displayName: "Full Data Form Cell",
	defaultMemberJson: {
		"type": "apogee.Folder",
		"childrenNotWriteable": true,
		"children": {
			"input": {
				"name": "input",
				"type": "apogee.JsonMember",
				"fields": {
					"data": ""
				}
			},
			"value": {
				"name": "value",
				"type": "apogee.JsonMember",
				"fields": {
					"data": ""
				}
			}
		}
	},
    defaultComponentJson: {
        type: "apogeeapp.FullDataFormCell",
        fields: {
            layoutCode: "return [];",
            validatorCode: "return true;"
        }
    }
}
export default FullDataFormComponentConfig;





