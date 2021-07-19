
import ParentComponent from "/apogeejs-app-lib/src/component/ParentComponent.js";

/** This component represents a table object. */
export default class FolderComponent extends ParentComponent {}

//======================================
// This is the component generator, to register the component
//======================================

FolderComponent.displayName = "Page";
FolderComponent.uniqueName = "apogeeapp.PageComponent";
FolderComponent.DEFAULT_MEMBER_JSON = {
    "type": "apogee.Folder"
};

FolderComponent.contentFolderFieldName = "member";


