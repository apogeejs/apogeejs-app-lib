import {getSerializedHardcodedTable} from "/apogeejs-model-lib/src/apogeeModelLib.js";

/** This method gets the Defaule member json for a Form Input Component.
 * - dataMemberTypeName - the name for the data member type
 * - additionalChildMemberArray - OPTIONAL - An array of additional member JSON objects which should be added as children in the main folder for this object.
 */
export function getFormComponentDefaultMemberJson(dataMemberTypeName,additionalChildMemberArray) {
    let defaultJson = {
        "type": "apogee.Folder",
        "childrenNotWriteable": true,
        "children": {
            "formData": {
                "name": "formData",
                "type": "apogee.JsonMember",
                "fields": {
                    "data": ""
                }
            },
            "formResult": {
                "name": "formResult",
                "type": "apogee.JsonMember",
                "fields": {
                    "data": "",
                    "contextParentGeneration": 2
                }
            },
            "data": getSerializedHardcodedTable("data",dataMemberTypeName)
        }
    }

    //add additional children, if applicable
    if(additionalChildMemberArray) {
        additionalChildMemberArray.forEach(childJson => {
            defaultJson.children[childJson.name] = childJson;
        });
    }
    
    return defaultJson;
}