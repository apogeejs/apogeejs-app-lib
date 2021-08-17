import Component from "/apogeejs-app-lib/src/component/Component.js";

/** This attempt has a single form edit page which returns an object. */
// To add - I should make it so it does not call set data until after it is initialized. I will cache it rather 
//than making the user do that.

/** This is a custom resource component. 
 * To implement it, the resource script must have the methods "run()" which will
 * be called when the component is updated. It also must have any methods that are
 * confugred with initialization data from the model. */
class CustomDataComponent extends Component {

    //==============================
    //Resource Accessors
    //==============================

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

//======================================
// This is the control generator, to register the control
//======================================

const CustomDataComponentConfig = {
    componentClass: CustomDataComponent,
    displayName: "Custom Data Cell",
    defaultMemberJson: {
        "type": "apogee.Folder",
        "childrenNotWriteable": true,
        "children": {
            "input": {
                "name": "input",
                "type": "apogee.JsonMember",
                "fields": {
                    "data":"",
                }
            },
            "data": {
                "name": "data",
                "type": "apogee.JsonMember",
                "fields": {
                    "data": "",
                }
            }
        }
    },
    defaultComponentJson: {
        type: "apogeeapp.CustomDataCell",
        fields: {
            destroyOnInactive: false,
            html: "",
            css: "",
            uiCode: ""
        }
    }
}
export default CustomDataComponentConfig;


