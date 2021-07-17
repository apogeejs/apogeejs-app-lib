import Component from "/apogeejs-app-lib/src/component/Component.js";

/** This is a custom resource component. 
 * To implement it, the resource script must have the methods "run()" which will
 * be called when the component is updated. It also must have any methods that are
 * confugred with initialization data from the model. */
export default class FullDataFormComponent extends Component {

    constructor(member,modelManager,instanceToCopy,keepUpdatedFixed) {
        super(member,modelManager,instanceToCopy,keepUpdatedFixed);

        //this should be present in the json that builds the folder, but in case it isn't (for one, because of a previous mistake)
        member.setChildrenWriteable(false);
        
        let model = modelManager.getModel();
        //==============
        //Fields
        //==============
        //Initailize these if this is a new instance
        if(!instanceToCopy) {
            this.setField("layoutCode","return []");
            this.setField("validatorCode","return true");

            //internal tables
            let valueMember = member.lookupChild(model,"value");
            this.registerMember(modelManager,valueMember,"member.value",false);

            let inputMember = member.lookupChild(model,"input");
            this.registerMember(modelManager,inputMember,"member.input",false);
        }
    };

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

    //==============================
    // serialization
    //==============================

    writeExtendedData(json,modelManager) {
        json.layoutCode = this.getField("layoutCode");
        json.validatorCode = this.getField("validatorCode");
    }

    loadExtendedData(json) {
        if(json.layoutCode) { 
            this.updateLayoutCode(json.layoutCode); 
        }

        if(json.validatorCode) {
            this.updateValidatorCode(json.validatorCode)
        }
    }

    updateLayoutCode(layoutCodeText) { 
        let oldLayoutCodeText = this.getField("layoutCode");
        if(layoutCodeText != oldLayoutCodeText) {
            this.setField("layoutCode",layoutCodeText);
        }
    }

    updateValidatorCode(validatorCodeText) { 
        let oldValidatorCodeText = this.getField("validatorCode");
        if(validatorCodeText != oldValidatorCodeText) {
            this.setField("validatorCode",validatorCodeText);
        }
    }

}

//======================================
// This is the control generator, to register the control
//======================================

FullDataFormComponent.displayName = "Full Data Form Cell";
FullDataFormComponent.uniqueName = "apogeeapp.FullDataFormCell";
FullDataFormComponent.DEFAULT_MEMBER_JSON = {
    "type": "apogee.Folder",
    "childrenNotWriteable": true,
    "children": {
        "input": {
            "name": "input",
            "type": "apogee.JsonMember",
            "updateData": {
                "data": "",
            }
        },
        "value": {
            "name": "value",
            "type": "apogee.JsonMember",
            "updateData": {
                "data": "",
            }
        }
    }
};

//FullDataFormComponent.COMPONENT_PROPERTY_MAP
FullDataFormComponent.COMPONENT_DATA_MAP = {
    "layoutCode": "return [];",
    "validatorCode": "return true;"
}
//FullDataFormComponent.MEMBER_PROPERTY_LIST




