/** This is a form that the is configurable.
 * 
 * @param {type} viewMode - the apogee view mode
 * @param {type} getLayout - this callback retrieves the form layout
 */
apogeeapp.app.ConfigurableFormDisplay = class extends apogeeapp.app.NonEditorDataDisplay {
    
    constructor(viewMode,getLayout) {
        super(viewMode,apogeeapp.app.NonEditorDataDisplay.SCROLLING);  
        
        this.getLayout = getLayout;
        
        this.panel = this.panel = new apogeeapp.ui.ConfigurablePanel();
    }
    
    /** This method will return undefined until showData is called. */
    getContent() {
        if(this.panel) {
            return this.panel.getElement();
        }
        else {
            return undefined;
        }
    }
    
    getContentType() {
        return apogeeapp.ui.FIXED_SIZE;
    }
    
    
    //this sets the data into the editor display. REQUIRED
    showData() {
        var layout = this.getLayout();
        if(apogee.util.getObjectType(layout) != "Array") {
            layout = [
                {
                    type: "heading",
                    text: "INVALID FORM LAYOUT!",
                    level: 4
                }
            ];
        }
        
        this.panel.configureForm(layout);
    }
    
    /**  Override this to return a custom empty value
     * @protected */
    getTableEditSettings() {
        return apogeeapp.app.ConfigurableFormDisplay.TABLE_EDIT_SETTINGS;
    }

}

//set a custom empty value - an empty array
apogeeapp.app.ConfigurableFormDisplay.TABLE_EDIT_SETTINGS = {
    "viewModes": apogeeapp.app.BasicControlComponent.VIEW_MODES,
    "defaultView": apogeeapp.app.BasicControlComponent.VIEW_OUTPUT,
    "emptyDataValue": []
}
