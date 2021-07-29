import Component from "/apogeejs-app-lib/src/component/Component.js";

import "/apogeejs-app-lib/src/commands/literatepagetransaction.js";
import { createFolderSchema, createEditorState, EMPTY_DOC_JSON } from "/apogeejs-app-lib/src/document/apogeeSchema.js";

/** This is the base class for a parent component (an object that has children),
 * It extends the component class. */
export default class ParentComponent extends Component {

    constructor(member,modelManager,instanceToCopy,keepUpdatedFixed,) {
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
        let contentFolderFieldName = this.constructor.getConfigField("contentFolderFieldName");
        return this.getField(contentFolderFieldName);
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

    instantiateTabDisplay() {
        let member = this.getMember();
        let folder = this.getParentFolderForChildren();
        return new LiteratePageComponentDisplay(this,member,folder); 
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
        //save the editor state
        let editorState = this.getField("editorState");
        if(editorState) {
            let document = editorState.doc;
            json.data = {};
            json.data.doc = document.toJSON();
        }
        
        //save the children
        var folder = this.getParentFolderForChildren();
        var childrenPresent = false;
        var children = {};
        var childIdMap = folder.getChildIdMap();
        for(var key in childIdMap) {
            var childId = childIdMap[key];
            var childComponentId = modelManager.getComponentIdByMemberId(childId);
            var childComponent = modelManager.getComponentByComponentId(childComponentId);
            var name = childComponent.getName();
            children[name] = childComponent.toJson(modelManager);
            childrenPresent = true;
        }
        if(childrenPresent) {
            json.children = children;
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

    /** This method loads the children for this component */
    loadChildrenFromJson(modelManager,componentJson) {
        if(componentJson.children) {
            let parentMember = this.getParentFolderForChildren();
            
            for(let childName in componentJson.children) {
                let childMember = parentMember.lookupChild(modelManager.getModel(),childName);
                if(childMember) {
                    let childComponentJson = componentJson.children[childName];
                    modelManager.createComponentFromMember(childMember,childComponentJson);
                }
            };

        }
    }

    /** This is used to update properties, such as from the set properties form. */
    loadPropertyValues(modelManager,json) {
        super.loadPropertyValues(modelManager,json);

        //load properties in child components if needed
        if(json.children) {
            let model = modelManager.getModel();
            let parentMember = this.getParentFolderForChildren();
            for(let childName in json.children) {
                let childMember = parentMember.lookupChild(model,childName);
                if(childMember) {
                    let childJson = componentJson.children[childName];
                    let childComponentId = modelManager.getComponentIdByMemberId(memberId);
                    let childComponent = modelManager.getComponentByComponentId(childComponentId);
                    childComponent.loadPropertyValues(modelManager,childJson);
                }
            }
        }
    }

}

/** This is used to flag this as an edit component. */
ParentComponent.isParentComponent = true;

//The following config property should be added to indicate the field name for the folder member which holds the children.
//ExtendingComponent.CLASS_CONFIG.contentFolderFieldName