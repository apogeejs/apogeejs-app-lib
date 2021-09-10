import Component from "/apogeejs-app-lib/src/component/Component.js";

/** This method creates the resource. */
function onUiCodeUpdate(component,uiGeneratorBody) {
    var resource;
    if((uiGeneratorBody)&&(uiGeneratorBody.length > 0)) {
        //compile the user code for the generator
        var generatorFunction;
        try {
            generatorFunction = new Function(uiGeneratorBody);
        }
        catch(error) {
            resource = {
                displayInvalid: true,
                message: "Error parsing uiGenerator code: " + error.toString()
            }
            if(error.stack) console.error(error.stack);
            generatorFunction = null;
        }

        //execute the generator function
        if(generatorFunction) {
            try {
                resource = generatorFunction();
            }
            catch(error) {
                resource = {
                    displayInvalid: true,
                    message: "Error executing uiGenerator code: " + error.toString()
                }
                if(error.stack) console.error(error.stack);
            }
        }
    }
    else {
        //generator not yet present
        resource = {};
    }

    component.setField("resource",resource);
}

const CustomComponentConfig = {
    componentClass: Component,
    displayName: "Custom Cell",
    defaultMemberJson: {
        "type": "apogee.DataMember"
    },
    defaultComponentJson: {
        type: "apogeeapp.CustomCell",
        fields: {
            destroyOnInactive: false,
            html: "",
            css: "",
            uiCode: ""
        }
    },
    fieldFunctions: {
		uiCode: {
			fieldChangeHandler: onUiCodeUpdate 
		}
	}
}
export default CustomComponentConfig;






