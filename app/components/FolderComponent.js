import LiteratePageComponentDisplay from "/apogeeapp/app/component/literatepage/LiteratePageComponentDisplay.js";
import "/apogeeapp/app/component/literatepage/literatepagetransaction.js";
import { createProseMirrorManager } from "/apogeeapp/app/component/literatepage/proseMirrorSetup.js";

import Component from "/apogeeapp/app/component/Component.js";
import ParentComponent from "/apogeeapp/app/component/ParentComponent.js";

import { Selection } from "/prosemirror/lib/prosemirror-state/src/index.js";

/** This component represents a table object. */
export default class FolderComponent extends ParentComponent {

    constructor(workspaceUI,folder) {
        //extend parent component
        super(workspaceUI,folder,FolderComponent);
        
        //create an empty edit state to start
        this.editorManager = createProseMirrorManager(this);
        this.editorData = this.editorManager.createEditorState();
    };


    getEditorData() {
        return this.editorData;
    }

    setEditorData(editorData) {
        this.editorData = editorData;
        
        //this should be in an event for the change
        var tabDisplay = this.getTabDisplay();
        if(tabDisplay) {
            tabDisplay.updateDocumentData(this.editorData);
        }
    }

    getEditorManager() {
        return this.editorManager;
    }

    //----------------------------------------
    // Editor Command Processing
    //----------------------------------------
    
    /** This method is called to respond to transactions created in the editor. */
    applyTransaction(transaction) {
        
        //console.log("New Transaction:");
        //console.log("Doc changed: " + transaction.docChanged);

        if(transaction.docChanged) {

            //command
            let commandData;
            let deletedComponentCommands;

            //see if we need to delete any apogee nodes
            var deletedApogeeComponents = this.getDeletedApogeeComponentShortNames(this.editorData,transaction);

            if(deletedApogeeComponents.length > 0) {
                let doDelete = confirm("Are you sure you want to delete these apogee nodes: " + deletedApogeeComponents);
                //do not do delete.
                if(!doDelete) return;

                //do the delete
                deletedComponentCommands = this.getDeletedComponentCommandsFromShortNames(deletedApogeeComponents);
            }

            //create the editor command to delete the component node
            var editorCommand = this.createEditorCommand(transaction);

            //combine commands or use the editor command directly
            if(deletedComponentCommands) {
                commandData = {};
                commandData.type = "compoundCommand";
                commandData.childCommands = [];

                //add the delete commands
                pushSecondArrayIntoFirst(commandData.childCommands,deletedComponentCommands);
                //add the editor command
                commandData.childCommands.push(editorCommand);
            }
            else {
                commandData = editorCommand;
            }

            //execute the command
            this.getWorkspaceUI().getApp().executeCommand(commandData);
        }
        else {
            //this is a editor state change that doesn't change the data
            this.editorData = this.editorData.apply(transaction);
            this.fieldUpdated("document");
            
            if(this.tabDisplay) {
                this.tabDisplay.updateDocumentData(this.editorData);
            }
        }
    }

    /** This function returns the names of any apogee components nodes which are deleted in the
     * given transaction. */
    getDeletedApogeeComponentShortNames(editorData, transaction) {
        //prepare to get apogee nodes
        let apogeeComponents = [];
        let getApogeeComponents = node => {
        if(node.type.name == "apogeeComponent") {
            var componentShortName = node.attrs.name; //we should change this node attribute name
            apogeeComponents.push(componentShortName);
        }
        //do not go inside any top level nodes
        return false;
        }
    
        //get all the replcaed apogee components
        transaction.steps.forEach( (step,index) => {
            let doc = transaction.docs[index];
            if(step.jsonID == "replace") {
                doc.nodesBetween(step.from,step.to,getApogeeComponents);
            }
            else if(step.jsonID == "replaceAround") {
                doc.nodesBetween(step.from,step.gapFrom,getApogeeComponents);
                doc.nodesBetween(step.gapTo,step.to,getApogeeComponents);
            }
        });
    
        return apogeeComponents;
    
    }

    /** This function creates component delete commands from a list of short component names. */
    getDeletedComponentCommandsFromShortNames(deletedApogeeComponents) {
        //map the names to delete commands
        return deletedApogeeComponents.map(shortName => {
            let fullName = this.member.getChildFullName(shortName);
            let componentDeleteCommand = {};
            componentDeleteCommand.type = "deleteComponent";
            componentDeleteCommand.memberFullName = fullName;
            return componentDeleteCommand;
        });
    }

    //------------------------------------------
    // Editor command processing from commands created outside the editor
    //------------------------------------------

    /** This function turns a transaction into an application command. This is used
     * for the command path for commands generated outside the editor. */
    createEditorCommand(transaction) {
        var stepsJson = [];
        var inverseStepsJson = [];

        for(var i = 0; i < transaction.steps.length; i++) {
            var step = transaction.steps[i];
            stepsJson.push(step.toJSON());
            var stepDoc = transaction.docs[i];
            var inverseStep = step.invert(stepDoc);
            inverseStepsJson.push(inverseStep.toJSON()); 
        }

        var commandData = {};
        commandData.type = "literatePageTransaction";
        commandData.memberFullName = this.member.getFullName();
        commandData.steps = stepsJson;
        commandData.undoSteps = inverseStepsJson;
        
        return commandData;
    }
      
    getInsertApogeeNodeOnPageCommands(shortName,insertAtEnd) {
        let state = this.getEditorData();
        let schema = state.schema;
        let transaction = state.tr;
        let commands = {};
        
        if(!insertAtEnd) {
            let { empty } = state.selection;
            if(!empty) {

                transaction = transaction.deleteSelection(); 

                //see if we need to delete any apogee nodes
                var deletedApogeeComponents = this.getDeletedApogeeComponentShortNames(this.editorData,transaction);

                if(deletedApogeeComponents.length > 0) {
                    //create delete commands
                    commands.deletedComponentCommands = this.getDeletedComponentCommandsFromShortNames(deletedApogeeComponents); 
                }
            }
        }
        else {
            //insert at end
            //move selection to end
            let docLength = state.doc.content.size;
            let $pos = state.doc.resolve(docLength);
            let selection = new Selection($pos,$pos);
            transaction = transaction.setSelection(selection);
        }

        //finish the document transaction
        transaction = transaction.replaceSelectionWith(schema.nodes.apogeeComponent.create({ "name": shortName }));
      
        commands.editorCommand = this.createEditorCommand(transaction);

        return commands;
        
    }

    getRemoveApogeeNodeFromPageCommand(childShortName) {
        var state = this.getEditorData();
      
        let {found,from,to} = this.editorManager.getComponentRange(state,childShortName);
        //end test

        if(found) {
            let transaction = state.tr.delete(from, to);
            var commandData = this.createEditorCommand(transaction);
            return commandData;
        }
        else {
            return null;
        }
    }

        
    //end test code
    //=========================================================================
        
    instantiateTabDisplay() {
        var folder = this.getMember();
        return new LiteratePageComponentDisplay(this,folder,folder); 
    }

    //==============================
    // serialization
    //==============================

    /** This serializes the table component. */
    writeToJson(json) {
        //save the editor state
        if(this.editorData) {
            json.data = this.editorData.toJSON();
        }
        
        //save the children
        var folder = this.getMember();
        var workspaceUI = this.getWorkspaceUI();
        json.children = workspaceUI.getFolderComponentContentJson(folder);

        return json;
    }

    readFromJson(json) {
        //read the editor state
        if((json.data)&&(json.data.doc)) {
            this.editorData = this.editorManager.createEditorState(json.data.doc);
            this.fieldUpdated("document");
        }
    }

    /** This method is used to load the child components from a json */
    readChildrenFromJson(workspaceUI,childActionResults,json) {
        if(json.children) {
            workspaceUI.loadFolderComponentContentFromJson(childActionResults,json.children);
        }
        return true;  
    }

    //======================================
    // Static methods
    //======================================

    //if we want to allow importing a workspace as this object, we must add this method to the generator
    static appendWorkspaceChildren(optionsJson,childrenJson) {
        optionsJson.children = childrenJson;
    }

}

//this is a method to help construct an emtpy folder component
FolderComponent.EMPTY_FOLDER_COMPONENT_JSON  = {
    "type":"apogeeapp.app.FolderComponent"
};

//======================================
// This is the component generator, to register the component
//======================================

FolderComponent.displayName = "Folder";
FolderComponent.uniqueName = "apogeeapp.app.FolderComponent";
FolderComponent.DEFAULT_WIDTH = 500;
FolderComponent.DEFAULT_HEIGHT = 500;
FolderComponent.ICON_RES_PATH = "/componentIcons/folder.png";
FolderComponent.TREE_ENTRY_SORT_ORDER = Component.FOLDER_COMPONENT_TYPE_SORT_ORDER;
FolderComponent.DEFAULT_MEMBER_JSON = {
    "type": "apogee.Folder"
};


//================================
// Some internal functions
//================================

function pushSecondArrayIntoFirst(first,second) {
    for(var i = 0; i < second.length; i++) {
        first.push(second[i]);
    }
}