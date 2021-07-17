import {defineHardcodedJsonTable} from "/apogeejs-model-lib/src/apogeeModelLib.js";
import FormInputBaseComponent from "/apogeejs-app-lib/src/components/FormInputBaseComponent.js";
import apogeeutil from "/apogeejs-util-lib/src/apogeeUtiLlib.js"

/** This is a simple custom component example. */
export default class DesignerDataFormComponent extends FormInputBaseComponent {
    constructor(member,modelManager,instanceToCopy,keepUpdatedFixed) {
        super(member,modelManager,instanceToCopy,keepUpdatedFixed);

        //==============
        //Fields
        //==============
        //Add a field to the base class
        let model = modelManager.getModel();
        if(!instanceToCopy) {
            this.setField("validatorCode","return true");

            //internal tables
            let valueMember = member.lookupChild(model,"value");
            if(valueMember) this.registerMember(modelManager,valueMember,"member.value",false);
        }
    }

    getAllowInputExpressions() {
        let allowInputExpressions = this.getField("allowInputExpressions");
        if(allowInputExpressions === undefined) allowInputExpressions = DEFAULT_ALLOW_INPUT_EXPRESSIONS;
        return allowInputExpressions;
    }

    setAllowInputExpressions(allowInputExpressions) {
        let oldAllowInputExpressions = this.getField("allowInputExpressions");
        if(oldAllowInputExpressions != allowInputExpressions) {
            this.setField("allowInputExpressions",allowInputExpressions);
        }
    }

    //==============================
    //Resource Accessors
    //==============================

    /** This method compiles the layout function entered by the user. It returns
     * the fields  {formLayoutFunction,validatorFunction,errorMessage}. */
     createValidatorFunction() {
        var validatorCodeText = this.getField("validatorCode");
        var validatorFunction, errorMessage;

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

        return {validatorFunction, errorMessage};
    }


    //==============================
    // serialization
    //==============================

    writeExtendedData(json,modelManager) {
        json.validatorCode = this.getField("validatorCode");
    }

    writeExtendedProps(json,modelManager) {
        json.allowInputExpressions = this.getAllowInputExpressions();
    }

    loadExtendedData(json) {
        if(json.validatorCode) {
            this.updateValidatorCode(json.validatorCode)
        }
    }

    updateValidatorCode(validatorCodeText) { 
        let oldValidatorCodeText = this.getField("validatorCode");
        if(validatorCodeText != oldValidatorCodeText) {
            this.setField("validatorCode",validatorCodeText);
        }
    }

    loadExtendedProps(json) {
        if(json.allowInputExpressions !== undefined) {
            this.setAllowInputExpressions(json.allowInputExpressions);
        }
    }

    /** This optional static function reads property input from the property 
     * dialog and copies it into a component property json. */
     static transferComponentProperties(inputValues,propertyJson) {
        if(inputValues.allowInputExpressions !== undefined) {
            propertyJson.allowInputExpressions = inputValues.allowInputExpressions;
        }
    }
}

const DEFAULT_ALLOW_INPUT_EXPRESSIONS = true;

const DATA_MEMBER_FUNCTION_BODY = `
if(formResult) return apogeeui.ConfigurablePanel.getGeneratedFormLayout(formResult);
else return [];
`


//this defines the hardcoded type we will use
let dataMemberTypeName = "apogee.DesignerDataFormMember";
defineHardcodedJsonTable(dataMemberTypeName,DATA_MEMBER_FUNCTION_BODY);

//here we define the component
FormInputBaseComponent.initializeClass(DesignerDataFormComponent,"Data Form Cell","apogeeapp.DesignerDataFormCell",dataMemberTypeName);

//add an additional member table by modifying the default json
let defaultJson = apogeeutil.jsonCopy(DesignerDataFormComponent.DEFAULT_MEMBER_JSON);
defaultJson.children.value = {
    "name": "value",
    "type": "apogee.JsonMember",
    "updateData": {
        "data": ""
    }
}
DesignerDataFormComponent.DEFAULT_MEMBER_JSON =  defaultJson;

DesignerDataFormComponent.COMPONENT_PROPERTY_MAP = {
    "allowInputExpressions": true
}
DesignerDataFormComponent.COMPONENT_DATA_MAP = {
    "validatorCode": "return true;"
}
//DesignerDataFormComponent.MEMBER_PROPERTY_LIST



