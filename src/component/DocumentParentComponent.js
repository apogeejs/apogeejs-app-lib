import Component from "/apogeejs-app-lib/src/component/Component.js";

import "/apogeejs-app-lib/src/commands/literatepagetransaction.js";
import { createFolderSchema, createEditorState, EMPTY_DOC_JSON } from "/apogeejs-app-lib/src/document/apogeeSchema.js";

/** This is the base class for a parent component (an object that has children),
 * It extends the component class. */
export default class DocumentParentComponent extends Component {

    constructor(member,modelManager,instanceToCopy,keepUpdatedFixed,componentConfig) {
        //base constructor
        super(member,modelManager,instanceToCopy,keepUpdatedFixed,componentConfig);

        //==============
        //Fields
        //==============
        //We must do a one time initialization of the prose mirror schema 
        if(!instanceToCopy) {
            //initialize the schema
            this.initializeSchema(modelManager);
        }
    }

    getSchema() {
        return this.getField("schema");
    }

    /** This method sets the document. It also allows for temporarily storing some editor info 
     * to accompany a set document */
    setEditorState(editorState) {
        //for now set dummy data to show a change
        this.setField("editorState",editorState);
    }

    getEditorState() {
        return this.getField("editorState");
    }

    /** This method should be called only when a new component is created, and not when it is copied. It creates the schema
     * and an initial empty document for the page. It must be called after the parent folder for the page children is initialized. */
    initializeSchema(modelManager) {
        let pageFolderMember = this.getParentFolderForChildren();
        let schema = createFolderSchema(modelManager.getApp(),pageFolderMember.getId());
        this.setField("schema",schema);
    }

    convertEditorStateToJson(fieldValue) {
        let document = fieldValue.doc;
        let jsonValue = {};
        jsonValue.doc = document.toJSON();
        return jsonValue;
    }

    convertJsonToEditorState(jsonValue) {
        if(jsonValue.doc) {
            let docJson = jsonValue.doc;
            let fieldValue = createEditorState(this.getSchema(),docJson);
            return fieldValue;
        }
        else {
            //we shuldn't get here. The function should not be called if doc data missing
            return null;
        }
    }
}