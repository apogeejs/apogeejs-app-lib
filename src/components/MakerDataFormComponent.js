import {defineHardcodedJsonTable} from "/apogeejs-model-lib/src/apogeeModelLib.js";
import FormInputBaseComponent from "/apogeejs-app-lib/src/components/FormInputBaseComponent.js";
import apogeeutil from "/apogeejs-util-lib/src/apogeeUtiLlib.js"

/** This is a simple custom component example. */
export default class MakerDataFormComponent extends FormInputBaseComponent {
    constructor(member,modelManager,instanceToCopy,keepUpdatedFixed) {
        super(member,modelManager,instanceToCopy,keepUpdatedFixed);

        //==============
        //Fields
        //==============
        //Add a field to the base class
        let model = modelManager.getModel();
        if(!instanceToCopy) {
            //internal tables
            let valueMember = member.lookupChild(model,"value");
            if(valueMember) this.registerMember(modelManager,valueMember,"member.value",false);
        }
    }
}

const DATA_MEMBER_FUNCTION_BODY = `
if(formResult.formData) return apogeeui.ConfigurablePanel.getGeneratedFormLayout(formResult.formData);
else return [];
`


//this defines the hardcoded type we will use
let dataMemberTypeName = "apogee.MakerDataFormMember";
defineHardcodedJsonTable(dataMemberTypeName,DATA_MEMBER_FUNCTION_BODY);

//here we define the component
FormInputBaseComponent.initializeClass(MakerDataFormComponent,"Maker Data Form Cell","apogeeapp.MakerDataFormCell",dataMemberTypeName);

//add an additional member table by modifying the default json
let defaultJson = apogeeutil.jsonCopy(MakerDataFormComponent.DEFAULT_MEMBER_JSON);
defaultJson.children.value = {
    "name": "value",
    "type": "apogee.JsonMember",
    "updateData": {
        "data": ""
    }
}
MakerDataFormComponent.DEFAULT_MEMBER_JSON =  defaultJson;

