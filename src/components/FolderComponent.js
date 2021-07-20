
import ParentComponent from "/apogeejs-app-lib/src/component/ParentComponent.js";

/** This component represents a table object. */
export default class FolderComponent extends ParentComponent {}

//======================================
// This is the component generator, to register the component
//======================================

FolderComponent.CLASS_CONFIG = {
	displayName: "Page",
	uniqueName: "apogeeapp.PageComponent",
	defaultMemberJson: {
		"type": "apogee.Folder"
	},
	contentFolderFieldName: "member"
}


