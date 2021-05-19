import apogeeutil from "/apogeejs-util-lib/src/apogeeUtilLib.js";

import {EventManager} from "/apogeejs-base-lib/src/apogeeBaseLib.js";
import CommandManager from "/apogeejs-app-lib/src/commands/CommandManager.js";
import WorkspaceManager from "/apogeejs-app-lib/src/WorkspaceManager.js";

/** @private */
let apogeeInstance = null;

//======================================
//class definition
//======================================

/** This is the main class of the apogee application. 
 * This constuctor should not be called externally, the static creation method 
 * should be used. This is a singleton.
 * 
 * @private */
export default class Apogee {

    constructor() {

        //mixin initialization
        this.eventManagerMixinInit();
        
        //make sure we define this once
        if(apogeeInstance != null) {
            throw new Error("Error: There is already an Apogee app instance - the Apogee class is a singleton.");
        }
        else {
            apogeeInstance = this;
        }
        
        //---------------------------------
        //construct the base app structures
        //---------------------------------
        
        //workspace manager
        this.workspaceManager = null;
        
        //component generators
        this.componentClasses = {};
        this.standardComponents = [];
        //these are a list of names of components that go in the "added component" list
        this.additionalComponents = [];
        
        //default settings
        this.appSettings = {};
        
        //command manager
        this.commandManager = new CommandManager(this);

        //module manager
        this.moduleManager = new (apogeeplatform.getModuleManagerClass())(this);

        //subscribe to app events
        this.subscribeToAppEvents()
        
        //initialize application
        this._initApp();
    }

    /** This subscribes to all events needed by this class. On close, all listeners will be removed. This will 
     * be called to add back the need app events. */
    subscribeToAppEvents() {
        //subscribe to events
        this.addListener("workspaceDirty",() => this._setWorkspaceIsDirty());
    }

    //======================================
    // static singleton methods
    //======================================

    /** This retrieves an existing instance. It does not create an instance. */
    static getInstance() {
        return apogeeInstance;
    }

    //==================================
    // Workspace Management
    //==================================

    /** This method returns the active WorkspaceManager object. */
    getWorkspaceManager() {
        return this.workspaceManager;
    }

    createWorkspaceManager() {
        return new WorkspaceManager(this);
    }

    /** This method returns the active model object. */
    getModelManager() {
        if(this.workspaceManager) {
            return this.workspaceManager.getModelManager();
        }
        else {
            return null;
        }
    }

    /** This method returns the active model object. */
    getModel() {
        if(this.workspaceManager) {
            return this.workspaceManager.getModelManager().getModel();
        }
        else {
            return null;
        }
    }

    /** This method makes an empty workspace object. This can be used to set the initial workspace
     * manager or to give the new instance of the workspace manager. However, if the workspace manager
     * is being updated it must have the same ID as the existing workspace manager or else an exception
     * will be thrown.
     */
    setWorkspaceManager(workspaceManager) {
        //we can only have one workspace of a given id
        if((this.workspaceManager)&&(this.workspaceManager.getId() != workspaceManager.getId())) {
            throw new Error("There is already an open workspace");
        }
        this.workspaceManager = workspaceManager;
        return true;
    }

    /** This method closes the active workspace. */
    clearWorkspaceManager() {
        //remove the workspace from the app
        this.workspaceManager = null;
        
        return true;
    }

    //====================================
    // Command Management
    //====================================

    /** This method should be called to execute commands. */
    executeCommand(command) {
        return this.commandManager.executeCommand(command);
    }

    /** This method is intended for the UI for the undo/redo functionality */
    getCommandManager() {
        return this.commandManager;
    }

    /** This method returns true if the workspcae contains unsaved data. */
    getWorkspaceIsDirty() {
        if(this.workspaceManager) {
            return this.workspaceManager.getIsDirty();
        }
        else {
            return false;
        }
    }

    /** This method clears the workspace dirty flag. */
    clearWorkspaceIsDirty() {
        if(this.workspaceManager) {
            return this.workspaceManager.clearIsDirty();
        }
        else {
            return false;
        }
    }

    /** This method returns true if the workspcae contains unsaved data. 
     * @private */
    _setWorkspaceIsDirty() {
        if(this.workspaceManager) {
            return this.workspaceManager.setIsDirty();
        }
        else {
            return false;
        }
    }

    //====================================
    // Module Management
    //====================================

    openModuleManager() {
        if(this.moduleManager) {
            this.moduleManager.openModuleManager();
        }
        else {
            apogeeUserAlert("Module manager service not available!");
        }
    }

    //==================================
    // App Initialization
    //==================================

    /** This returns the JSON file for the initial workspace. It reads it from the URL. */
    async _getInitialWorkspace() {
        var workspaceUrl = apogeeutil.readQueryField("url",document.URL);
        if(workspaceUrl) {
            return apogeeutil.jsonRequest(workspaceUrl);
        }
        else {
            return null;
        }
    }
        
    /** This completes application initialization after any settings have been set. 
     * @private
     * */    
    async _initApp() {
            
        try {
            //open the initial workspace or create a new workspace
            let workspaceJson = await this._getInitialWorkspace();

            if(workspaceJson) {
                //open workspace
                var commandData = {};
                commandData.type = "openWorkspace";
                commandData.workspaceJson = workspaceJson;

                this.executeCommand(commandData);
            }
            else {
                var commandData = {};
                commandData.type = "openWorkspace";
                
                this.executeCommand(commandData);
            }
        }
        catch(error) {
            if(error.stack) console.error(error.stack);

            let errorMsg = error.message ? error.message : error.toString();
            apogeeUserAlert("Error loading initial workspace: " + errorMsg);
        }
        
    }
}

//add mixins to this class
apogeeutil.mixin(Apogee,EventManager);


Apogee.DEFAULT_Workspace_NAME = "workspace";
