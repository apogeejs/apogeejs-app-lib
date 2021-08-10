import ParentComponent from "/apogeejs-app-lib/src/component/ParentComponent.js";

import "/apogeejs-app-lib/src/commands/literatepagetransaction.js";
import { createFolderSchema, createEditorState, EMPTY_DOC_JSON } from "/apogeejs-app-lib/src/document/apogeeSchema.js";

/** This is the base class for a parent component (an object that has children),
 * It extends the component class. */
export default class DocumentParentComponent extends ParentComponent {

    constructor(member,modelManager,instanceToCopy,keepUpdatedFixed) {
        //base constructor
        super(member,modelManager,instanceToCopy,keepUpdatedFixed);

        //==============
        //Fields
        //==============
        //The following fields are added by the parent component. In order to add these, the method
        //"initializeSchema" must be called. See the notes on that method.
        //"schema"
        //"editorState"
        if(!instanceToCopy) {
            //initialize the schema
            this.initializeSchema(modelManager);
        }
    }

    /** This returns the folder member which holds the child content. */
    getParentFolderForChildren() {
        let contentFolderFieldPath = this.constructor.getConfigField("contentFolderFieldPath");
        return this.getDirectChildMember(contentFolderFieldPath);
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
        //initialize with an empty document
        let editorState = createEditorState(schema,EMPTY_DOC_JSON);
        this.setField("editorState",editorState);
    }

    //==============================
    // serialization
    //==============================

    /** This serializes the table component. */
    writeExtendedData(json,modelManager) {
        json = super.writeExtendedData(json,modelManager);

        //save the editor state
        let editorState = this.getField("editorState");
        if(editorState) {
            let document = editorState.doc;
            json.data = {};
            json.data.doc = document.toJSON();
        }

        return json;
    }

    loadExtendedData(json) {
        let editorState;
        let docJson;
        //read the editor state
        if((json.data)&&(json.data.doc)) {
            //parse the saved document
            docJson = json.data.doc;
        }
        else {
            //no document stored - create an empty document
            docJson = EMPTY_DOC_JSON;
        }
        editorState = createEditorState(this.getSchema(),docJson);
        this.setField("editorState",editorState);
    }
}

/** This is used to flag this as an edit component. */
ParentComponent.isParentComponent = true;

//The following config property should be added to indicate the field name for the folder member which holds the children.
//ExtendingComponent.CLASS_CONFIG.contentFolderFieldName