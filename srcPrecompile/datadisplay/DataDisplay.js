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
    constructor(dataSource) {
        this.component = null
        this.dataSource = dataSource ? dataSource : {};
        this.editOk = false;
        this.displayValid = true; //default this to true, so simple displays don't need to use it

        this.setEditMode = undefined
        this.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_NONE
        this.message = null
        this.hideDisplay = false

        //defaults for container sizing logic
        this.useContainerHeightUi = false
    }

    setComponent(component) {
        this.component = component
    }

    getComponent() {
        return this.component
    }

    /** This is used to pass is and clear the setEditMode function */
    setEditModeState(editMode,setEditMode) {
        this.editMode = editMode
        this.setEditMode = setEditMode
    }

    isInEditMode() {
        return this.editMode
    }

    getMessageType() {
        return this.messageType
    }

    getMessage() {
        return this.message
    }

    setMessage(messageType,message) {
        this.messageType = messageType ? messageType : DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_NONE 
        this.message = message
    }

    setHideDisplay(hideDisplay) {
        this.hideDisplay = hideDisplay
    }

    getHideDisplay() {
        return this.hideDisplay
    }

    /** This method returns {reloadDataDisplay, reloadData}, indicating if the data display or the data need to be updated. */
    doUpdate() {
        if(this.dataSource) {
            return this.dataSource.doUpdate(this.component);
        }
        else {
            return {
                    reloadData: false,
                    reloadDataDisplay: false
                };
        }
    }
    
    /** For edit mode, this is used to save data in the data display editor. */
    save() {
        var data;
        var dataValid = false;
        try {
            data = this.getData();
            dataValid = true;
        }
        catch(error) {
            if(error.stack) console.error(error.stack);
            apogeeUserAlert("Error loading data from data display: " + error.message);
        }

        //save data if we read it out
        if(dataValid) {
            var saveComplete;

            //figure out if there is a problem with this - we hav to end edit mode before
            //we save because in edit mode it will not overwrite the data in the display
            //if we fail, we restart edit mode below
            this.endEditMode();

            if(this.dataSource.saveData) {
                try {
                    saveComplete = this.dataSource.saveData(data,this.component,this);
                }
                catch(error) {
                    if(error.stack) console.error(error.stack);
                    apogeeUserAlert("Error saving data: " + error.message);
                    saveComplete = false;
                }
            }
            else {
                apogeeUserAlert("Error: Data not saved: save callback not set!");
                saveComplete = false;
            }

            //end edit mode if we entered it
            if(!saveComplete) {
                this.startEditMode();
            }
        }
    }

    /** For edit mode, this is used to cancel editing. */
    cancel() {
        //reset the original data
        //var cancelComplete = this.displayContainer.onCancel();
        //
        //if(cancelComplete) {
        //    this.endEditMode();
        //}

        //reshow old data
        this.showData();
        this.endEditMode();
    }

    getDisplayContainer() {
        //return this.displayContainer;
        alert("DOH! getDisplayContainer of DataDisplay")
    }

    getDataSource() {
        return this.dataSource;
    }

    getComponentView() {
        //return this.displayContainer.getComponentView();
        alert("DOH! getComponetView of DataDisplay")
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

    /** This method should be called when the underlying display is loaded, indicating if it is 
     * valid or if it should not be used. */
    setDisplayValid(displayValid) {
        this.displayValid = displayValid;
    }
	
    /** This method udpates the data in the data display, reading it from the underlying data source. */
    updateData() {
        if(!this.displayValid) return;

        //get edit ok
        if(this.dataSource.getEditOk) {
            this.editOk = this.dataSource.getEditOk(this.component)
        }
        else {
            this.editOk = false;
        }

        //update the display data
        let dataResult = this.dataSource.getData(this.component)
        this.hideDisplay = (this.dataSource.hideDisplay === true) 
        if(dataResult.messageType) {
            this.messageType = dataResult.messageType
            this.message = dataResult.message
        }
        else {
            this.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_NONE
            this.message = ""
        }
        this.internalUpdateData(dataResult.data)
    }

    //showDisplay

    /** @protected */
    endEditMode() {
        //this.displayContainer.endEditMode();
        if(this.setEditMode) this.setEditMode(false)
    }
    
    /** @protected */
    startEditMode() {
        //var onSave = () => this.save();
        //var onCancel = () => this.cancel();
        //this.displayContainer.startEditMode(onSave,onCancel);
        if(this.setEditMode) this.setEditMode(true)
    }

    /** @protected */
    onTriggerEditMode() {
        if(this.editOk) {
            this.startEditMode();
        }
    }
} 