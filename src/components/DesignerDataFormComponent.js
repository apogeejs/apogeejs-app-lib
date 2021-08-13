import Component from "/apogeejs-app-lib/src/component/Component.js";
import {getFormComponentDefaultMemberJson} from "/apogeejs-app-lib/src/components/formInputComponentUtils.js";
import {defineHardcodedJsonTable} from "/apogeejs-model-lib/src/apogeeModelLib.js";

/** This is a simple custom component example. */
export default class DesignerDataFormComponent extends Component {

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

}

const DATA_MEMBER_FUNCTION_BODY = `
if(formResult) return apogeeui.ConfigurablePanel.getGeneratedFormLayout(formResult);
else return [];
`


//this defines the hardcoded type we will use
const dataMemberTypeName = "apogee.DesignerDataFormMember";
defineHardcodedJsonTable(dataMemberTypeName,DATA_MEMBER_FUNCTION_BODY);

//here we configure the component
const ADDITIONAL_CHILD_MEMBER_ARRAY =  [
    {
        "name": "value",
        "type": "apogee.JsonMember",
        "updateData": {
            "data": ""
        }
    }
];

DesignerDataFormComponent.CLASS_CONFIG = {
	displayName: "Data Form Cell",
	defaultMemberJson: getFormComponentDefaultMemberJson(dataMemberTypeName,ADDITIONAL_CHILD_MEMBER_ARRAY),
    defaultComponentJson: {
        type: "apogeeapp.DesignerDataFormCell",
        allowInputExpressions: true,
		validatorCode: "return true;"
    }
}



