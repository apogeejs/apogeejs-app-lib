import Component from "/apogeeapp/component/Component.js";

/** This is the base class for a editable component (an object with code or data),
 * It extends the component class. */
export default class EditComponent extends Component {  
    
    constructor(workspaceUI,member,componentGenerator) {    
        //base constructor
        super(workspaceUI,member,componentGenerator);
    }

    //===============================
    // Protected Functions
    //===============================

    //Implement this in extending class
    ///**  This method retrieves the table edit settings for this component instance
    // * @protected */
    //getTableEditSettings();

    usesTabDisplay() {    
        return false;
    }

    instantiateTabDisplay() {
        return null;
    }

}

/** This is used to flag this as an edit component. */
EditComponent.isEditComponent = true;
    

