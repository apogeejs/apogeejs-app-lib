import Component from "/apogeejs-app-lib/src/component/Component.js";
import {defineHardcodedJsonTable} from "/apogeejs-model-lib/src/apogeeModelLib.js";
import {getFormComponentDefaultMemberJson} from "/apogeejs-app-lib/src/components/formInputComponentUtils.js";

/** This is a deprecated way of creating the FormInputBaseComponent. See documentation for the more up to date method.
 * @deprecated
*/
export default class FormInputBaseComponent extends Component {

    /** A class should be made to extend this base class. Then this initializer should be called with
     * the state class object to complete initialization of the class. */
    static initializeClass(classObject,cellDisplayName,cellUniqueName,memberFunctionBody) {

        //create the hard coded member
        dataMemberTypeName = cellUniqueName + "-data";
        defineHardcodedJsonTable(dataMemberTypeName,memberFunctionBody);

        let classConfig = {};
        classConfig.displayName = cellDisplayName;
        classConfig.defaultMemberJson = getFormComponentDefaultMemberJson(dataMemberTypeName);
        classConfig.defaultComponentJson = {type: cellUniqueName};
        classObject.CLASS_CONFIG = classConfig;
    }
}

