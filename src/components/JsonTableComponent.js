import Component from "/apogeejs-app-lib/src/component/Component.js";

/** This component represents a json table object. */
export default class JsonTableComponent extends Component {};

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


// const CLASS_CONFIG = {
//     displayName: "Data Cell",
//     uniqueName: "apogeeapp.JsonCell",
//     COMPONENT_PROPERTY_MAP: {
//         "dataView": DEFAULT_DATA_VIEW
//     },
//     DEFAULT_MEMBER_JSON: {
//         "type": "apogee.JsonMember"
//     }
// }

// Component.configureClass(CLASS_CONFIG);





