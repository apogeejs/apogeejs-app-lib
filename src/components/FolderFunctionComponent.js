import apogeeutil from "/apogeejs-util-lib/src/apogeeUtilLib.js";
import ParentComponent from "/apogeejs-app-lib/src/component/ParentComponent.js";

/** This component represents a folderFunction, which is a function that is programmed using
 *apogee tables rather than writing code. */
export default class FolderFunctionComponent extends ParentComponent {

    /** This overrides the get display method of componnet to return the function declaration. */
    getDisplayName(useFullPath,modelManagerForFullPathOnly) {
        let member = this.getMember();
        var name = useFullPath ? this.getFullName(modelManagerForFullPathOnly) : this.getName();
        var argList = member.getArgList();
        var argListString = argList.join(",");
        var returnValueString = member.getReturnValueString();
        
        var displayName = name + "(" + argListString + ")";
        if((returnValueString != null)&&(returnValueString.length > 0)) {
            displayName += " = " + returnValueString;
        }
        
        return displayName;
    }

    /** This method returns true if the display name field is updated. This method exists because
     * display name is potentially a compound field and this is a systematic way to see if it has changed.
     * Components modifying the getDisplayName method should also update this method.
     * Note this method only applies when useFullPath = false. We currently don't implement a method to see
     * if the full name was updated. */
    isDisplayNameUpdated() {
        return this.getMember().areAnyFieldsUpdated(["name","argList","returnValue"]);
    }


    /** We overide this method because of custom procesing in the arg list input */
    static transferMemberProperties(inputValues,propertyJson) {
        if(!propertyJson.updateData) propertyJson.updateData = {};
        if(inputValues.argListString !== undefined) {
            propertyJson.updateData.argList = apogeeutil.parseStringArray(inputValues.argListString);
        }
        if(inputValues.returnValueString !== undefined) {
            propertyJson.updateData.returnValue = inputValues.returnValueString;
        }
    }
}

//======================================
// This is the component generator, to register the component
//======================================

FolderFunctionComponent.displayName = "Multi-Cell Function";
FolderFunctionComponent.uniqueName = "apogeeapp.PageFunctionComponent";
FolderFunctionComponent.DEFAULT_MEMBER_JSON = {
    "type": "apogee.FolderFunction",
    "children": {
        "body": {
            "name": "body",
            "type": "apogee.Folder",
        }
    }
};

FolderFunctionComponent.MEMBER_PROPERTY_LIST = ["argList","returnValueString"];

FolderFunctionComponent.contentFolderFieldName = "member.body";

