import Component from "/apogeejs-app-lib/src/component/Component.js";

/** This overrides the get display method of componnet to return the function declaration. */
function getDisplayName(component,standardDisplayName) {
    let member = component.getMember();
    var argList = member.getArgList();
    var argListString = argList.join(",");
    var returnValueString = member.getReturnValueString();
    
    var displayName = standardDisplayName + "(" + argListString + ")";
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
function isDisplayNameUpdated(component) {
    return component.getMember().areAnyFieldsUpdated(["name","argList","returnValue"]);
}


const FolderFunctionComponentConfig = {
    componentClass: Component,
	displayName: "Multi-Cell Function",
	defaultMemberJson: {
		"type": "apogee.FolderFunction",
		"children": {
			"body": {
				"name": "body",
				"type": "apogee.Folder"
			}
		}
	},
	defaultComponentJson: {
		type: "apogeeapp.PageFunctionComponent",
        // fields: {
		// 	editorState: {
		// 		doc: {"type":"doc","content":[{"type":"paragraph"}]}
		// 	}
		// }
	},
	childParentFolderPath: "body",
    // fieldFunctions: {
	// 	editorState: {
	// 		fieldToJson: (component,fieldValue,modelManager) => component.convertEditorStateToJson(fieldValue),
	// 		jsonToField: (component,jsonValue,modelManager) => component.convertJsonToEditorState(jsonValue)
	// 	}
	// },
    instanceDisplayName: {
        getDisplayName: getDisplayName,
        isDisplayNameUpdated: isDisplayNameUpdated
    },

    viewModes: [],
    isParentOfChildEntries: true,
    iconResPath: "/icons3/pageFunctionIcon.png",
    propertyDialogEntries: [
        {
            member: ".",
            propertyKey: "argList",
            dialogElement: {
                "type":"textField",
                "label":"Arg List: ",
                "size": 80,
                "key":"argListString"
            },
            propertyToForm: argListValue => argListValue.toString(),
            formToProperty: argListString => apogeeutil.parseStringArray(argListString)
        },
        {
            member: ".",
            propertyKey: "returnValue",
            dialogElement: {
                "type":"textField",
                "label":"Return Val: ",
                "size": 40,
                "key":"returnValue"
            }
        }
    ]
}
export default FolderFunctionComponentConfig;

// memberPropertyList: [
//     "argList",
//     "returnValue"
// ]
