import Component from "/apogeejs-app-lib/src/component/Component.js";

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

const FullActionFormComponentConfig = {
    componentClass: Component,
	displayName: "Full Action Form Cell",
	defaultMemberJson: {
		"type": "apogee.JsonMember"
	},
    defaultComponentJson: {
        type: "apogeeapp.FullActionFormCell",
        fields: {
            "layoutCode": "return [];"
        }
    },
    fieldFunctions: {
		layoutCode: {
			fieldChangeHandler: onLayoutCodeUpdate 
		}
	}
}
export default FullActionFormComponentConfig;




