import Component from "/apogeejs-app-lib/src/component/Component.js";

/** This component represents a json table object. */
export default class JsonTableComponent extends Component {};

JsonTableComponent.CLASS_CONFIG = {
    displayName: "Data Cell",
    defaultMemberJson: {
        "type": "apogee.JsonMember"
    },
    defaultComponentJson: {
        type: "apogeeapp.JsonCell",
        dataView: "Colorized"
    }
}





