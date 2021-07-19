import Component from "/apogeejs-app-lib/src/component/Component.js";

/** This component represents a json table object. */
export default class ErrorComponent extends Component {

    //==============================
    // Protected and Private Instance Methods
    //==============================

    /** This overrides the save method to return the original input. */
    toJson(modelManager) {
        return this.getField("completeJson");
    }

    /** This overrides the open deserialize method to save the entire json. */
    loadFromJson(json) {
        this.setField("completeJson",json);
    }

    //======================================
    // Static methods
    //======================================

}

//======================================
// This is the component generator, to register the component
//======================================

ErrorComponent.displayName = "Error Cell";
ErrorComponent.uniqueName = "apogeeapp.ErrorCell";
ErrorComponent.DEFAULT_MEMBER_JSON = {
    "type": "apogee.ErrorMember"
};

