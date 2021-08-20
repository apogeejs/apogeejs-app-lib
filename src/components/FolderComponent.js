
import DocumentParentComponent from "/apogeejs-app-lib/src/component/DocumentParentComponent.js";

const FolderComponentConfig = {
	componentClass: DocumentParentComponent,
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
	childParentFolderPath: ".",
	fieldTranslators: {
		editorState: {
			fieldToJson: (component,fieldValue,modelManager) => component.convertEditorStateToJson(fieldValue),
			jsonToField: (component,jsonValue,modelManager) => component.convertJsonToEditorState(jsonValue)
		}
	}
}
export default FolderComponentConfig;


