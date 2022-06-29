
import Component from "/apogeejs-app-lib/src/component/Component.js";

const FolderComponentConfig = {
	displayName: "Page",
	defaultMemberJson: {
		"type": "apogee.Folder"
	},
	defaultComponentJson: {
		type: "apogeeapp.PageComponent",
		// fields: {
		// 	editorState: {
		// 		doc: {"type":"doc","content":[{"type":"paragraph"}]}
		// 	}
		// }
	},
	childParentFolderPath: ".",
	// fieldFunctions: {
	// 	editorState: {
	// 		fieldToJson: (component,fieldValue,modelManager) => component.convertEditorStateToJson(fieldValue),
	// 		jsonToField: (component,jsonValue,modelManager) => component.convertJsonToEditorState(jsonValue)
	// 	}
	// },

    isParentOfChildEntries: true,
    iconResPath: "/icons3/pageIcon.png"
}
export default FolderComponentConfig;


