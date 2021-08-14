
import DocumentParentComponent from "/apogeejs-app-lib/src/component/DocumentParentComponent.js";

/** This component represents a table object. */
export default class FolderComponent extends DocumentParentComponent {}

//======================================
// This is the component generator, to register the component
//======================================

FolderComponent.CLASS_CONFIG = {
	displayName: "Page",
	defaultMemberJson: {
		"type": "apogee.Folder"
	},
	defaultComponentJson: {
		type: "apogeeapp.PageComponent",
		fields: {
			editorState: {
				doc: {"type":"doc","content":[{"type":"paragraph"}]}
			}
		}
	},
	childParentFolderPath: "."
}


