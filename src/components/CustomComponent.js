import Component from "/apogeejs-app-lib/src/component/Component.js";

/** This is a custom resource component. 
 * To implement it, the resource script must have the methods "run()" which will
 * be called when the component is updated. It also must have any methods that are
 * confugred with initialization data from the model. */
export default class CustomComponent extends Component {

    //==============================
    //Resource Accessors
    //==============================

    /** This method creates the resource. */
    createResource() {
        var uiGeneratorBody = this.getField("uiCode");
        
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

        return resource;
    }


    /** We override this method to allow support for a elgacy serialized format,
     * which was from before version 2.
     */
     loadExtendedData(json) {
        ////////////////////////////////////////
        //legacy format - json.resource.* for resource fields
        //changed for version 2
        //////////////////////////////////////////
        if(json.resource) {
            for(let fieldName in json.resource) {
                let oldFieldValue = this.getField(fieldName);
                let newFieldValue = json.resource[fieldName];
                if(newFieldValue != oldFieldValue) {
                    this.setField(fieldName,newFieldValue);
                }
            }
        }
        else {
            super.loadExtendedData(json);
        }
    }
}

CustomComponent.CLASS_CONFIG = {
    displayName: "Custom Cell",
    defaultMemberJson: {
        "type": "apogee.JsonMember"
    },
    defaultComponentJson: {
        type: "apogeeapp.CustomCell",
        destroyOnInactive: false,
        html: "",
        css: "",
        uiCode: ""
    }
}






