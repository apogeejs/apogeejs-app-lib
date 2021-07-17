import Component from "/apogeejs-app-lib/src/component/Component.js";

/** This component represents a json table object. */
export default class JsonTableComponent extends Component {
    
        
    constructor(member,modelManager,instanceToCopy,keepUpdatedFixed) {
        //extend edit component
        super(member,modelManager,instanceToCopy,keepUpdatedFixed);

        //==============
        //Fields
        //==============
        //Initailize these if this is a new instance
        if(!instanceToCopy) {
            //default view
            this.setField("dataView",JsonTableComponent.DEFAULT_DATA_VIEW);
        }
    };

    getDataView() {
        let dataView = this.getField("dataView");
        if(!dataView) dataView = JsonTableComponent.DEFAULT_DATA_VIEW;
        return dataView;
    }

    setDataView(dataView) {
        let oldDataView = this.getField("dataView");
        if(oldDataView != dataView) {
            this.setField("dataView",dataView);
        }
    }

    //==============================
    // serialization and properties
    //==============================

    writeExtendedProps(json,modelManager) {
        json.dataView = this.getDataView();
    }

    loadExtendedProps(json) {
        if(json.dataView !== undefined) {
            this.setDataView(json.dataView);
        }
    }


    /** This optional static function reads property input from the property 
     * dialog and copies it into a member property json. It is not needed for
     * this componnet. */
    //transferMemberProperties(inputValues,propertyJson) {
    //}

    /** This optional static function reads property input from the property 
     * dialog and copies it into a component property json. */
    static transferComponentProperties(inputValues,propertyJson) {
        if(inputValues.dataView !== undefined) {
            propertyJson.dataView = inputValues.dataView;
        }
    }
}

//======================================
// This is the component generator, to register the component
//======================================

const DEFAULT_DATA_VIEW = "Colorized";


/** This is the display name for the type of component */
JsonTableComponent.displayName = "Data Cell";
/** This is the univeral uniaue name for the component, used to deserialize the component. */
JsonTableComponent.uniqueName = "apogeeapp.JsonCell";

JsonTableComponent.DEFAULT_MEMBER_JSON = {
    "type": "apogee.JsonMember"
};

JsonTableComponent.COMPONENT_PROPERTY_MAP = {
    "dataView": DEFAULT_DATA_VIEW
}
//JsonTableComponent.COMPONENT_DATA_MAP
//JsonTableComponent.MEMBER_PROPERTY_LIST





