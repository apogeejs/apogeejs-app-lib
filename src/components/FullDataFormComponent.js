import Component from "/apogeejs-app-lib/src/component/Component.js";

/** This is a custom resource component. 
 * To implement it, the resource script must have the methods "run()" which will
 * be called when the component is updated. It also must have any methods that are
 * confugred with initialization data from the model. */
export default class FullDataFormComponent extends Component {

    //==============================
    //Resource Accessors
    //==============================

    /** This method compiles the layout function entered by the user. It returns
     * the fields  {formLayoutFunction,validatorFunction,errorMessage}. */
    createFormFunctions() {
        var layoutCodeText = this.getField("layoutCode");
        var validatorCodeText = this.getField("validatorCode");
        var layoutFunction, validatorFunction, errorMessage;

        if((layoutCodeText !== undefined)&&(layoutCodeText !== null)) {
            try {
                //create the layout function
                layoutFunction = new Function("commandMessenger","inputData",layoutCodeText);
            }
            catch(error) {
                errorMessage = "Error parsing layout function code: " + error.toString()
                if(error.stack) console.error(error.stack);
            }
        }
        else {
            layoutFunction = () => [];
        }

        if((validatorCodeText !== undefined)&&(validatorCodeText !== null))  {
            try {
                //create the validator function
                validatorFunction = new Function("formValue","inputData",validatorCodeText);
            }
            catch(error) {
                errorMessage = "Error parsing validator function code: " + error.toString()
                if(error.stack) console.error(error.stack);
            }
        }
        else {
            validatorFunction = () => true;
        }

        return { layoutFunction, validatorFunction, errorMessage};
    }
}

FullDataFormComponent.CLASS_CONFIG = {
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





