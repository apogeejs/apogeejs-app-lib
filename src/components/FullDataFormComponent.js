import Component from "/apogeejs-app-lib/src/component/Component.js";

//-----------------------
// Handlers for field changes, to update linked fields
//-----------------------

/** This updates the layout function when the layout code is updated. */
function onLayoutCodeUpdate(component,layoutCode) {
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

    component.setField("layoutFunction",layoutFunctionFieldValue);
}

/** This updates the validator function when the validator code is updated. */
function onValidatorCodeUpdate(component,validatorCode) {
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

    component.setField("validatorFunction",validatorFunctionFieldValue);
}


const FullDataFormComponentConfig = {
    componentClass: Component,
	displayName: "Full Data Form Cell",
	defaultMemberJson: {
		"type": "apogee.Folder",
		"childrenNotWriteable": true,
		"children": {
			"input": {
				"name": "input",
				"type": "apogee.DataMember",
				"fields": {
					"data": ""
				}
			},
			"value": {
				"name": "value",
				"type": "apogee.DataMember",
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
    },
    fieldFunctions: {
		layoutCode: {
			fieldChangeHandler: onLayoutCodeUpdate 
		},
        validatorCode: {
			fieldChangeHandler: onValidatorCodeUpdate 
		}
	}
}
export default FullDataFormComponentConfig;





