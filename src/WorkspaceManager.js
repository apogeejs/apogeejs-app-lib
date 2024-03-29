import {FieldObject} from "/apogeejs-base-lib/src/apogeeBaseLib.js";

import CommandManager from "/apogeejs-app-lib/src/commands/CommandManager.js";
import ReferenceManager from "/apogeejs-app-lib/src/references/ReferenceManager.js";
import ModelManager from "/apogeejs-app-lib/src/ModelManager.js";
import { ModelRunContextLink } from "/apogeejs-model-lib/src/apogeeModelLib.js";


/** This class manages the workspace. */
export default class WorkspaceManager extends FieldObject {

    constructor(app,instanceToCopy) {
        super("workspaceManager",instanceToCopy);

        this.app = app;
        
        //==============
        //Fields
        //==============
        //Initailize these if this is a new instance
        if(!instanceToCopy) {
            let modelManager = new ModelManager(this.app);
            this.setField("modelManager",modelManager);

            let referenceManager = new ReferenceManager(this.app);
            this.setField("referenceManager",referenceManager);

            //this is not a field like above because when we do not require a command to change it
            this.isDirty = false;

            //temporary
            this.created = true;
        }
        else {
            //this is not a field like above because when we do not require a command to change it
            this.fileMetadata = instanceToCopy.fileMetadata;
            this.isDirty = instanceToCopy.isDirty;

            //temporary
            this.created = false;
        }

        //==============
        //NOn-field and working variables
        //==============
        this.runContextLink = new ModelRunContextLink(this.app.getRunContext());

        this.viewStateCallback = null;
        this.cachedViewState = null;

        this.isClosed = false;
    }

    //====================================
    // Workspace Management
    //====================================

    /** This gets the application instance. */
    getApp() {
        return this.app;
    }

    /** This method returns a mutable copy of this instance. If the instance is already mutable
     * it will be returned rather than making a new one.  */
    getMutableWorkspaceManager() {
        if(this.getIsLocked()) {
            //create a new instance that is a copy of this one
            return new WorkspaceManager(this.app,this);
        }
        else {
            //return this instance since it si already unlocked
            return this;
        }
    }

    // temporary implementation
    getChangeMap() {
        let changeMap = {};
        //workspace always changes
        let workspaceManagerEvent;
        if(this.isClosed) workspaceManagerEvent = "workspaceManager_deleted";
        else if(this.created)  workspaceManagerEvent = "workspaceManager_created"
        else workspaceManagerEvent = "workspaceManager_updated";
        changeMap[this.getId()] = {action: workspaceManagerEvent, instance: this};

        let referenceManager = this.getReferenceManager();
        let referenceChangeMap = referenceManager.getChangeMap();
        if(referenceChangeMap) Object.assign(changeMap,referenceChangeMap);

        let modelManager = this.getModelManager();
        let modelChangeMap = modelManager.getChangeMap();
        if(modelChangeMap) Object.assign(changeMap,modelChangeMap);

        return changeMap;
    }

    getChangeMapAll() {
        let changeMapAll = {};
        changeMapAll[this.getId()] = {action: "workspaceManager_updated", instance: this};

        let referenceManager = this.getReferenceManager();
        let referenceChangeMap = referenceManager.getChangeMapAll();
        if(referenceChangeMap) Object.assign(changeMapAll,referenceChangeMap);

        let modelManager = this.getModelManager();
        let modelChangeMap = modelManager.getChangeMapAll();
        if(modelChangeMap) Object.assign(changeMapAll,modelChangeMap);

        return changeMapAll;
    }

    /** This method locks this workspace instance and all the contained object instances. */
    lockAll() {
        //we maybe shouldn't be modifying the members in place, but we will do it anyway
        this.getReferenceManager().lockAll();
        this.getModelManager().lockAll();
        this.lock();
    }

    getReferenceManager() {
        return this.getField("referenceManager");
    }

    /** This method returns an unlocked reference manager instance. If the current
     * reference manager is unlocked it will return that. Otherwise it will return
     * a new unlocked instance that will also be set as the current instance. */
    getMutableReferenceManager() {
        let oldReferenceManager = this.getReferenceManager();
        if(oldReferenceManager.getIsLocked()) {
            //create a new instance that is a copy of this one
            let newReferenceManager = new ReferenceManager(this.app,oldReferenceManager);
            this.setField("referenceManager",newReferenceManager);
            return newReferenceManager;
        }
        else {
            //return this instance since it si already unlocked
            return oldReferenceManager;
        }
    }

    getModelManager() {
        return this.getField("modelManager");
    }

    /** This method returns an unlocked model manager instance. If the current
     * model manager is unlocked it will return that. Otherwise it will return
     * a new unlocked instance that will also be set as the current instance. */
    getMutableModelManager() {
        let oldModelManager = this.getModelManager();
        if(oldModelManager.getIsLocked()) {
            //create a new instance that is a copy of this one
            let newModelManager = new ModelManager(this.app,oldModelManager);
            this.setField("modelManager",newModelManager);
            return newModelManager;
        }
        else {
            //return this instance since it is already unlocked
            return oldModelManager;
        }
    }

    getIsDirty() {
        return this.isDirty;
    }
    
    setIsDirty() {
        this.isDirty = true;
    }
    
    clearIsDirty() {
        this.isDirty = false;
    }

    getIsClosed() {
        return this.isClosed;
    }
    
    
    //====================================
    // asynch run context methods
    //====================================

    /** This runs a command asynchronously */
    runFutureCommand(commandData) {
        //run command asynchronously
        setTimeout(() => this.app.executeCommand(commandData),0);
    }

    getRunContextLink() {
        return this.runContextLink;
    }

    //====================================
    // configuration
    //====================================

    /** This retrieves the file metadata used to save the file. */
    getFileMetadata() {
        return this.fileMetadata;
    }

    /** This method should be used to update the file metadata for the workspace, such as after the file is saved. */
    setFileMetadata(fileMetadata) {
        this.fileMetadata = fileMetadata;
    }

    //====================================
    // open and save methods
    //====================================

    setViewStateCallback(viewStateCallback) {
        this.viewStateCallback = viewStateCallback;
    }

    getCachedViewState() {
        return this.cachedViewState;
    }

    /** This saves the workspace. It the optionalSavedRootFolder is passed in,
     * it will save a workspace with that as the root folder. */
    toJson(optionalSavedRootFolder) {
        var json = {};
        json.fileType = "apogee app js workspace";

        json.version = WorkspaceManager.FILE_VERSION;

        json.references = this.getReferenceManager().toJson();

        json.code = this.getModelManager().toJson(optionalSavedRootFolder);

        if(this.viewStateCallback) {
            this.cachedViewState = this.viewStateCallback();
            if(this.cachedViewState) json.viewState = this.cachedViewState;
        }

        return json;
    }

    
     /** This method sets the workspace. The argument workspaceJson should be included
      * if the workspace is not empty, such as when opening a existing workspace. It
      * contains the data for the component associated with each model member. For 
      * a new empty workspace the workspaceJson should be omitted. 
      * The argument fileMetadata is the file identifier if the workspace is opened from a file.
      * This will be used for the "save" function to save to an existing file. */
     load(json,fileMetadata) {

        //check file format
        if(json) {
            if(json.version != WorkspaceManager.FILE_VERSION) {
                let msg = "Version mismatch. Expected version " + WorkspaceManager.FILE_VERSION + ", Found version " + json.version;
                throw new Error(msg);
            }
        }
        else {
            //create aan empty json to load
            json = {};
        }

        //store the file metadata
        this.fileMetadata = fileMetadata;

        //set the view state
        if(json.viewState !== undefined) {
            this.cachedViewState = json.viewState;
        }

        //check for references. If we have references we must load these before loading the model
        if(json.references) {
            //if there are references, load these before loading the model.
            //this is asynchronous so we must load the model in a future command
            let referenceManager = this.getReferenceManager();
            let referenceLoadPromise = referenceManager.load(this,json.references);

            let onReferencesLoaded = () => {
                //load references regardless of success or failure in loading references
                let loadModelCommand = {};
                loadModelCommand.type = "loadModelManager";
                loadModelCommand.json = json.code;
                this.runFutureCommand(loadModelCommand);
            }

            referenceLoadPromise.then(onReferencesLoaded);
        }
        else {
            //if there are not references we can load the model directly.
            let modelManager = this.getModelManager();
            modelManager.load(this,json.code);
        }
    }

    /** This method closes the workspace object. */
    close() {
        //close model manager
        let modelManager = this.getModelManager();
        modelManager.close();

        //close reference manager
        let referenceManager = this.getReferenceManager();
        referenceManager.close();

        //flag the workspace as closed
        this.isClosed = true;
    }

}

WorkspaceManager.FILE_VERSION = "1.0";


//=====================================
// Command Object
//=====================================

/*** 
 * This command loads the model manager. It is a follow on command to opening a workspace,
 * if there are references present, which must be loaded first.
 * 
 * commandData.type = "loadModelManager"
 * commandData.json = (json for the model/model manager)
 */

let loadmodelmanager = {};

//There is no undo command since this is a follow on to opening a workspace
//loadmodelmanager.createUndoCommand = function(workspaceManager,commandData) {

/** This method loads an existing, unpopulated model manager. It is intended only as
 * a asynchronous follow on command to opening a workspace, once any references have
 * been loaded.
 */
loadmodelmanager.executeCommand = function(workspaceManager,commandData) {
    try {
        let modelManager = workspaceManager.getMutableModelManager();
        return modelManager.load(workspaceManager,commandData.json);
    }
    catch(error) {
        throw error;
    }
}

loadmodelmanager.commandInfo = {
    "type": "loadModelManager",
    "targetType": "modelManager",
    "event": "updated"
}

CommandManager.registerCommand(loadmodelmanager);
