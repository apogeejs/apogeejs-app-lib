import Component from "/apogeejs-app-lib/src/component/Component.js";

/** This is a custom resource component. 
 * To implement it, the resource script must have the methods "run()" which will
 * be called when the component is updated. It also must have any methods that are
 * confugred with initialization data from the model. */
export default class CustomComponent extends Component {

    constructor(member,modelManager,instanceToCopy,keepUpdatedFixed) {
        super(member,modelManager,instanceToCopy,keepUpdatedFixed);
        
        //==============
        //Fields
        //==============
        //Initailize these if this is a new instance
        if(!instanceToCopy) {
            this.setField("destroyOnInactive",false); //default to keep alive
            this.setField("html","");
            this.setField("css","");
            this.setField("uiCode","");
        }
    };

    //==============================
    //Resource Accessors
    //==============================

    getDestroyOnInactive() {
        return this.getField("destroyOnInactive");
    }

    setDestroyOnInactive(destroyOnInactive) {
        if(destroyOnInactive != this.destroyOnInactive) {
            this.setField("destroyOnInactive",destroyOnInactive);
        }
    }

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


    //=============================
    // Action
    //=============================

    doCodeFieldUpdate(app,codeFieldName,targetValue) { 
        let initialValue = this.getField(codeFieldName);

        var command = {};
        command.type = "updateComponentField";
        command.memberId = this.getMemberId();
        command.fieldName = codeFieldName;
        command.initialValue = initialValue;
        command.targetValue = targetValue;

        app.executeCommand(command);
        return true;  
    }

    //==============================
    // serialization and properties
    //==============================

    writeExtendedData(json,modelManager) {
        //legacy format
        // json.resource = {};
        // json.resource["html"] = this.getField("html");
        // json.resource["css"] = this.getField("css");
        // json.resource["uiCode"] = this.getField("uiCode");

        json.html = this.getField("html");
        json.css = this.getField("css");
        json.uiCode = this.getField("uiCode");
    }

    writeExtendedProps(json,modelManager) {
        json.destroyOnInactive = this.getDestroyOnInactive();
    }

    loadExtendedData(json) {
        ////////////////////////////////////////
        //legacy format
        if(json.resource) {
            for(let fieldName in json.resource) {
                this.update(fieldName,json.resource[fieldName]);
            }
        }
        ///////////////////////////////////////

        if(json.html != undefined) {
            this.update("html",json.html)
        }
        if(json.css != undefined) {
            this.update("css",json.css)
        }
        if(json.uiCode != undefined) {
            this.update("uiCode",json.uiCode)
        }
    }

    update(fieldName,fieldValue) { 
        let oldFieldValue = this.getField(fieldName);
        if(fieldValue != oldFieldValue) {
            this.setField(fieldName,fieldValue);
        }
    }

    loadExtendedProps(json) {
        if(json.destroyOnInactive !== undefined) {
            this.setDestroyOnInactive(json.destroyOnInactive);
        }
    }

    static transferComponentProperties(inputValues,propertyJson) {
        if(inputValues.destroyOnInactive !== undefined) {
            propertyJson.destroyOnInactive = inputValues.destroyOnInactive;
        }
    }
}

//======================================
// This is the control generator, to register the control
//======================================

CustomComponent.displayName = "Custom Cell";
CustomComponent.uniqueName = "apogeeapp.CustomCell";
CustomComponent.DEFAULT_MEMBER_JSON = {
    "type": "apogee.JsonMember"
};

CustomComponent.COMPONENT_PROPERTY_MAP = {
    "destroyOnInactive": false
}
CustomComponent.COMPONENT_DATA_MAP = {
    "html": "",
    "css": "",
    "uiCode": ""
}
//CustomComponent.MEMBER_PROPERTY_LIST





