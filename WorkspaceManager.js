import base from "/apogeeutil/base.js";
import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import { Model, doAction } from "/apogee/apogeeCoreLib.js";
import EventManager from "/apogeeutil/EventManagerClass.js";

import ReferenceManager from "/apogeeapp/references/ReferenceManager.js";
import ModelManager from "/apogeeapp/ModelManager.js";


/** This class manages the workspace. */
export default class WorkspaceManager extends EventManager {

    constructor(app) {
        super();

        this.app = app;
        
        this.fileMetadata = null;
        this.modelManager = null;
        this.referenceManager = null;

        this.init();

        app.setWorkspaceManager(this);
    }

    //====================================
    // Workspace Management
    //====================================

    /** This gets the application instance. */
    getApp() {
        return this.app;
    }

    getReferenceManager() {
        return this.referenceManager;
    }

    getModelManager() {
        return this.modelManager;
    }

     /** This method sets the workspace. The argument workspaceJson should be included
      * if the workspace is not empty, such as when opening a existing workspace. It
      * contains the data for the component associated with each model member. For 
      * a new empty workspace the workspaceJson should be omitted. 
      * The argument fileMetadata is the file identifier if the workspace is opened from a file.
      * This will be used for the "save" function to save to an existing file. */
    load(workspaceJson,fileMetadata) {
                    // //publish result
                    // let asynchCommandResult = {};
                    // asynchCommandResult.cmdDone = true;
                    // asynchCommandResult.target = workspaceManager;
                    // asynchCommandResult.action = "updated";

        if((workspaceJson)&&(workspaceJson.version != WorkspaceManager.FILE_VERSION)) {
            let msg = "Version mismatch. Expected version " + WorkspaceManager.FILE_VERSION + ", Found version " + workspaceJson.version;
            alert(msg);
            throw new Error(msg);
        }

        this.fileMetadata = fileMetadata;

        var modelDataJson;
        var modelComponentsJson;

        if(workspaceJson) {
            modelDataJson = workspaceJson.model;
            modelComponentsJson = workspaceJson.components;
        }

        let commandResult = this.modelManager.load(modelDataJson,modelComponentsJson);

        return commandResult;
    }

    /** This method closes the workspace object. */
    close() {
        //close model manager
        this.modelManager.close();

        //close reference manager
        this.referenceManager.close();
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

    // //------------------------------------------
    // // Event Tracking Methods
    // //------------------------------------------

    getUpdated() {
        return this.updated;
    }

    isFieldUpdated(field) {
        return this.updated[field] ? true : false;
    }

    clearUpdated() {
        this.updated = {};
    }

    fieldUpdated(field) {
        this.updated[field] = true;
    }

    getEventId() {
        //for now we have a single fixed id for the workspace
        return "workspace";
    }

    getTargetType() {
        return "workspace";
    }

    //====================================
    // open and save methods
    //====================================

    /** This sets the application. It must be done before the workspace manager is opened. */
    init() {
        //create the model manager
        this.modelManager = new ModelManager(this);

        //create the reference manager
        this.referenceManager = new ReferenceManager(this.app);

        //initial - creating reference lists
        this.referenceManager.initReferenceLists(this.app.getReferenceClassArray());
        
        //listen to the workspace dirty event from the app
        this.app.addListener("workspaceDirty",() => this.setIsDirty());
    }

    /** This retrieves the file metadata used to save the file. */
    getFileMetadata() {
        return this.fileMetadata;
    }

    /** This method should be used to update the file metadata for the workspace, such as after the file is saved. */
    setFileMetadata(fileMetadata) {
        this.fileMetadata = fileMetadata;
    }

    /** This saves the workspace. It the optionalSavedRootFolder is passed in,
     * it will save a workspace with that as the root folder. */
    toJson(optionalSavedRootFolder) {
        var json = {};
        json.fileType = "apogee app js workspace";

        json.version = WorkspaceManager.FILE_VERSION;

        json.references = this.referenceManager.saveEntries();

        let {modelJson, componentsJson} = this.modelManager.toJson(optionalSavedRootFolder);
        json.model = modelJson;
        json.components = componentsJson;

        return json;
    }

}

WorkspaceManager.FILE_VERSION = "0.50";