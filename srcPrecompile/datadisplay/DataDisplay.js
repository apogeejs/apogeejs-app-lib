import DATA_DISPLAY_CONSTANTS from "/apogeejs-app-lib/src/datadisplay/dataDisplayConstants.js"

/** This is the base class for data displays, which show individual edit/display fields for a component. For example, a standard JSON
 * data component has three data displays, for the component value, the function body and the supplemental code.
 * 
 * @param {type} displayContainer - this is the ui container that will show the display
 * @param {type} dataSource - the dataSource for the editor. It is an object with the following functions:
 *  - {reloadDataDisplay, reloadData} = doUpdate(component) - Required - This function updates the component instance
 *      held by the data source and it returns to boolean values, "reloadDataDisplay", which indicates is the data display should 
 *      be reloaded (such as if it is replaced with a new data display or if the UI elements for it have been updated) and
 *      "reloadData" which indicates the data value displayed in the data display should be reloaded.  
 *  - data = getData(component) - Required - This returns model data that should be displayed. The format of the data depends on the 
 *      data display. If the data is not valid, then the value apogeeutil.INVALID_VALUE should be returned.
 *  - editOk = getEditOk(component) - Optional - If present, this indicates if the data display edit mode should be used. If it is not present
 *      it is assumed to be false.
 *  - closeDialog = saveData(data,component,dataDisplay) - Optional This is used if the data display edit mode is used. It should save the data. The return value
 *      should be true if the edit operation should be concluded. It should return false if there is a save failure such that you want to 
 *      stay in edit mode.
 *  - (other) - Optional - Data displays may define additional functions as needed for their implmentations. Examples where this is done in in the custom
 *      components to pass non-model data (like the HTML or the UI generator code) into the data display.
 */ 
export default class DataDisplay {
    constructor() {
        this.dataState = {}

        this.editModeData = null
        this._setEditModeData = undefined
        this._save = undefined

        this.hideDisplay = false

        //defaults for container sizing logic
        this.useContainerHeightUi = false
    }

    /** This is used to pass is and clear the setEditModeData function */
    setEditModeInfo(inEditMode,setEditModeData) {
        this.inEditMode = inEditMode
        this._setEditModeData = setEditModeData
    }

    setSave(saveFunction) {
        this._save = saveFunction
    }

    isInEditMode() {
        return this.inEditMode
    }

    getEditOk() {
        return this.dataState ? this.dataState.editOk : false
    }

    setDataState(dataState) {
        if(dataState) this.dataState = dataState
        else this.dataState = {}

        //temp implementation for early dev!!!
        this.internalUpdateData(this.dataState.data)
    }

    getDataState() {
        return this.dataState
    }

    simpleSave(data) {
        if(this._save) {
            this._save(data)
        }
        else {
            //we hopefully won't get this message
            apogeeUserAlert("Save not set inside of data display!")
        }
    }

    saveAndExitEditMode(data) {
        if(this._save) {
            this._save(data)
            this.endEditMode()
        }
        else {
            //we hopefully won't get this message
            apogeeUserAlert("Save not set inside of data display!")
        }
    }
    
    /** For edit mode, this is used to save data in the data display editor. */
    // save() {
    //     var data;
    //     var dataValid = false;
    //     try {
    //         data = this.getData();
    //         dataValid = true;
    //     }
    //     catch(error) {
    //         if(error.stack) console.error(error.stack);
    //         apogeeUserAlert("Error loading data from data display: " + error.message);
    //     }

    //     //save data if we read it out
    //     if(dataValid) {
    //         var saveComplete;

    //         //figure out if there is a problem with this - we hav to end edit mode before
    //         //we save because in edit mode it will not overwrite the data in the display
    //         //if we fail, we restart edit mode below
    //         this.endEditMode();

    //         if(this.dataState && this.dataState.saveData) {
    //             try {
    //                 saveComplete = this.dataState.saveData(data,this);
    //             }
    //             catch(error) {
    //                 if(error.stack) console.error(error.stack);
    //                 apogeeUserAlert("Error saving data: " + error.message);
    //                 saveComplete = false;
    //             }
    //         }
    //         else {
    //             apogeeUserAlert("Error: Data not saved: save callback not set!");
    //             saveComplete = false;
    //         }

    //         //end edit mode if we entered it
    //         if(!saveComplete) {
    //             this.startEditMode();
    //         }
    //     }
    // }

    /** For edit mode, this is used to cancel editing. */
    cancel() {
        this.showDisplay();
        this.endEditMode();
    }
    
    //=============================
    // Implemement in extending class
    //=============================
    
    //This method gets the data from the editor. OPTIONAL. Required if editing is enabled.
    //getData() {}
    
    //this sets the data into the editor display. REQUIRED if edit mode or save is used
    //setData(data) {}

    //TESTING
    //internalUpdateData
    //showDisplay
    
    //this method is called on loading the display. OPTIONAL
    //onLoad() {}
    
    //this method is called on unloading the display. OPTIONAL
    //onUnload() {}

    //this method is called when the display will be destroyed. OPTIONAL
    //destroy() {}
    
    //This method returns the content element for the data display REQUIRED
    //getContent() {}

    //---------------------------
    // UI State Management
    //---------------------------
    
    /** This method adds any data display state info to the view state json. 
     * By default there is none. Note that this modifies the json state of the view,
     * rather than providing a data object that will by added to it.. */
    addUiStateData(json) {

    }

    /** This method reads an data display state info from the view state json. */
    readUiStateData(json) {

    }

    //----------------------------
    // This is the View resize API
    // The display has controls for the user to resize the display. These use the 
    // following API to interact with the display
    //----------------------------

    // NOTE: DOCUMENT THE SIZE API. Example of info UI needs below from text editor
    // SIZE_COMMAND_INFO = {
    //     default: 15,
    //     min: 2,
    //     max: 100,
    //     increment: 1
    // }

    //setSize(size)

    //getSize()

    //=============================
    // protected, package and private Methods
    //=============================

    //showDisplay

    /** @protected */
    endEditMode() {
        if((this.isInEditMode())&&(this._setEditModeData)) {
            this._setEditModeData(null)
        }
    }
    
    /** @protected */
    startEditMode() {
        if((!this.isInEditMode())&&(this._setEditModeData)) {
            this._setEditModeData({getData: () => this.getData()})
        }
    }

    /** @protected */
    onTriggerEditMode() {
        if(this.getEditOk()) {
            this.startEditMode();
        }
    }
} 