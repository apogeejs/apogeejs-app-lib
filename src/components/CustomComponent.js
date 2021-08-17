import Component from "/apogeejs-app-lib/src/component/Component.js";

/** This is a custom resource component. 
 * To implement it, the resource script must have the methods "run()" which will
 * be called when the component is updated. It also must have any methods that are
 * confugred with initialization data from the model. */
class CustomComponent extends Component {

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
}

const CustomComponentConfig = {
    componentClass: CustomComponent,
    displayName: "Custom Cell",
    defaultMemberJson: {
        "type": "apogee.JsonMember"
    },
    defaultComponentJson: {
        type: "apogeeapp.CustomCell",
        fields: {
            destroyOnInactive: false,
            html: "",
            css: "",
            uiCode: ""
        }
    }
}
export default CustomComponentConfig;






