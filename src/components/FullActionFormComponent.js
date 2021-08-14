import Component from "/apogeejs-app-lib/src/component/Component.js";


/** This is a custom resource component. 
 * To implement it, the resource script must have the methods "run()" which will
 * be called when the component is updated. It also must have any methods that are
 * confugred with initialization data from the model. */
export default class FullActionFormComponent extends Component {

    //==============================
    //Resource Accessors
    //==============================

    /** This method compiles the layout function entered by the user. It returns
     * the fields  {formLayoutFunction,errorMessage}. */
    createFormLayoutFunction() {
        var formCodeText = this.getField("layoutCode");
        
        var formLayoutFunction;
        var errorMessage;
        if((formCodeText !== undefined)&&(formCodeText !== null)) {
            try {
                //create the layout function
                formLayoutFunction = new Function("commandMessenger","inputData",formCodeText);
            }
            catch(error) {
                errorMessage = "Error parsing uiGenerator code: " + error.toString()
                if(error.stack) console.error(error.stack);
            }
        }
        else {
            formLayoutFunction = () => [];
        }
        
        return {formLayoutFunction,errorMessage}
    }

}

//======================================
// This is the control generator, to register the control
//======================================

FullActionFormComponent.CLASS_CONFIG = {
	displayName: "Full Action Form Cell",
	defaultMemberJson: {
		"type": "apogee.JsonMember"
	},
    defaultComponentJson: {
        type: "apogeeapp.FullActionFormCell",
        fields: {
            "layoutCode": "return [];"
        }
    }
}




