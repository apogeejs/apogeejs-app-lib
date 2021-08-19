
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
	customSerializers: {
		editorState: {
			writeToJson: (component,fieldValue,fieldsJson,modelManager) => {
				let jsonValue = component.convertEditorStateToJson(fieldValue);
				fieldsJson["editorState"] = jsonValue;
			},
			loadFromJson: (component,jsonValue,modelManager) => {
				let fieldValue = component.convertJsonToEditorState(jsonValue);
				component.setField("editorState",fieldValue);
			}
		}
	}
}
export default FolderComponentConfig;


