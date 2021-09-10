import Component from "/apogeejs-app-lib/src/component/Component.js";

const JsonTableComponentConfig = {
    componentClass: Component,
    displayName: "Data Cell",
    defaultMemberJson: {
        "type": "apogee.DataMember"
    },
    defaultComponentJson: {
        type: "apogeeapp.JsonCell",
        fields: {
            dataView: "Colorized"
        }
    }
}
export default JsonTableComponentConfig;





