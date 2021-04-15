import Component from "/apogeejs-app-lib/src/component/Component.js";
import {getSerializedHardcodedTable,defineHardcodedJsonTable,Model} from "/apogeejs-model-lib/src/apogeeModelLib.js";

/** This is a simple custom component example. */
export default class FormInputBaseComponent extends Component {
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
            //internal tables
            let dataMember = member.lookupChild(model,"data");
            if(dataMember) this.registerMember(modelManager,dataMember,"member.data",false);

            let formDataMember = member.lookupChild(model,"formData");
            if(formDataMember) this.registerMember(modelManager,formDataMember,"member.formData",false);

            let formResultMember = member.lookupChild(model,"formResult");
            if(formResultMember) this.registerMember(modelManager,formResultMember,"member.formResult",false);
        }
    }

    /** A class should be made to extend this base class. Then this initializer should be called with
     * the state class object to complete initialization of the class. */
    static initializeClass(classObject,cellDisplayName,cellUniqueName,dataMemberTypeName) {

        ////////////////////////////////////////////////////////////////////////////////////////
        // LEGACY CODE CONSIDERATION
        // Briefly the last argument was the function body of the hard coded table. This code section accounts for 
        // any module made before then. (There were probably just two - chartjs, <= 3.1.1, and csv, <= 1.0.1)
        if(!Model.getMemberGenerator(dataMemberTypeName)) {
            //as called (legacy module usage) the last arg is the function body
            let functionBody = dataMemberTypeName
            dataMemberTypeName = cellUniqueName + "-data";
            defineHardcodedJsonTable(dataMemberTypeName,functionBody);
        }
        // END LEGACY CODE CONSIDERATION
        //////////////////////////////////////////////////////////////////////////////////////////

        //here we initialize some constants on the class
        classObject.displayName = cellDisplayName;
        classObject.uniqueName = cellUniqueName;
        classObject.DEFAULT_MEMBER_JSON = {
            "type": "apogee.Folder",
            "childrenNotWriteable": true,
            "children": {
                "formData": {
                    "name": "formData",
                    "type": "apogee.JsonMember",
                    "updateData": {
                        "data": ""
                    }
                },
                "formResult": {
                    "name": "formResult",
                    "type": "apogee.JsonMember",
                    "updateData": {
                        "data": "",
                        "contextParentGeneration": 2
                    }
                },
                "data": getSerializedHardcodedTable("data",dataMemberTypeName)
            }
        }
    }
}
