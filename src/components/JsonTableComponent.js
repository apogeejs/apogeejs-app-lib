import Component from "/apogeejs-app-lib/src/component/Component.js";

/** This component represents a json table object. */
export default class JsonTableComponent extends Component {};

JsonTableComponent.CLASS_CONFIG = {
    displayName: "Data Cell",
    uniqueName: "apogeeapp.JsonCell",
    componentFieldMap: {
        "dataView": "Colorized"
    },
    defaultMemberJson: {
        "type": "apogee.JsonMember"
    }
}





