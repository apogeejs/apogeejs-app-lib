import {FieldObject} from "/apogeejs-base-lib/src/apogeeBaseLib.js";

import {uiutil} from "/apogeejs-ui-lib/src/apogeeUiLib.js";
import apogeeutil from "/apogeejs-util-lib/src/apogeeUtilLib.js";

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

            //don't set dirty immediately - there is no info in an empty workspace
            this.setField("isDirty",false)

            //temporary
            this.created = true;
        }
        else {
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

    //-------------------------------
    // Workspace object interface
    //-------------------------------
    getChildren(workspaceManager) {
       return [this.getModelManager(),this.getReferenceManager()]
    }
    
    getState() {
        return apogeeutil.STATE_NORMAL
    }

    getStateMessage() {
        return ""
    }

    //This might be weird - the workspace manager uses the model name, the model manager uses the name "code"
    getName() {
        let modelManager = this.getModelManager()
        let model = modelManager.getModel()
        return model ? model.getName() : WORKSPACE_TEMP_NAME //there should be a model, unless we are waiing for asynch opening
    }

    getIconUrl() {
        return uiutil.getResourcePath(ICON_RES_PATH,"app")
    }

    //////////////////////////////

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

    /** This method returns a workspace object by object id
     * Currently supported: workspaceManager, modelManager, component, referenceManager, referenceEntry
     */
    getObject(objectId) {
        if(objectId == this.getId()) return this

        let modelManager = this.getModelManager()
        if(objectId == modelManager.getId()) {
            return modelManager
        }
        else {
            let component = modelManager.getComponentByComponentId(objectId)
            if(component) return component
        }

        let referenceManager = this.getReferenceManager()
        if(objectId == referenceManager.getId()) {
            return referenceManager
        }
        else {
            let refEntry = referenceManager.getRefEntryById(objectId)
            if(refEntry) return refEntry
        }

        return null
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
        return this.getField("isDirty")
    }
    
    setIsDirty() {
        this.setField("isDirty",true)
    }
    
    clearIsDirty() {
        this.setField("isDirty",false)
    }

    getIsClosed() {
        return this.isClosed;
    }
    
    
    //====================================
    // asynch run context methods
    //====================================

    getRunContextLink() {
        return this.runContextLink;
    }

    //====================================
    // configuration
    //====================================

    /** This retrieves the file metadata used to save the file. */
    getFileMetadata() {
        return this.getField("fileMetadata")
    }

    /** This method should be used to update the file metadata for the workspace, such as after the file is saved. */
    setFileMetadata(fileMetadata) {
        this.setField("fileMetadata",fileMetadata)
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

        let userInterfaceObject = this.app.getUserInterfaceObject()
        if((userInterfaceObject)&&(userInterfaceObject.getViewStateJson)) {
            let viewState = userInterfaceObject.getViewStateJson()
            if(viewState) json.viewState = viewState
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
                let msg = "Version mismatch. Expected version " + WorkspaceManager.FILE_VERSION + ", Found version " + json.version
                throw new Error(msg)
            }
        }
        else {
            //create aan empty json to load
            json = {}
        }

        //store the file metadata
        this.setFileMetadata(fileMetadata)

        //prepare the view state for loading, if applicable
        let setViewState
        if(json.viewState) {
            let userInterfaceObject = this.app.getUserInterfaceObject()
            if((userInterfaceObject)&&(userInterfaceObject.setViewStateJson)) {
                setViewState = () => userInterfaceObject.setViewStateJson(json.viewState)
            }
        }

        //check for references. If we have references we must load these before loading the model
        if(json.references) {
            //if there are references, load these before loading the model.
            //this is asynchronous so we must load the model in a future command
            let referenceManager = this.getReferenceManager()
            let referenceLoadPromise = referenceManager.load(this,json.references)

            let onReferencesLoaded = () => {
                //load references regardless of success or failure in loading references
                let loadModelCommand = {}
                loadModelCommand.type = "loadModelManager"
                loadModelCommand.json = json.code
                this.app.executeCommand(loadModelCommand)

                //set the view state after initial load completes
                //we probably don't need the setTimeout here
                if(setViewState) setTimeout(setViewState,0)
            }

            referenceLoadPromise.then(onReferencesLoaded)
        }
        else {
            //if there are not references we can load the model directly.
            let modelManager = this.getModelManager()
            modelManager.load(this,json.code)

            //set the view state after initial load completes
            //we need to wait for the command updates to complete. We should probably get a better way.
            if(setViewState) setTimeout(setViewState,0)
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


const ICON_RES_PATH = "/icons3/workspaceIcon.png"; 
const WORKSPACE_TEMP_NAME = "-"
