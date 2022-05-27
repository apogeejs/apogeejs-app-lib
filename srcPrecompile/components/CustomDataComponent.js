import Component from "/apogeejs-app-lib/src/component/Component.js";

import HtmlJsDataDisplay from "/apogeejs-app-lib/src/datadisplay/HtmlJsDataDisplay.js";
import dataDisplayHelper from "/apogeejs-app-lib/src/datadisplay/dataDisplayHelper.js";
import {getErrorViewModeEntry,getAppCodeViewModeEntry,getFormulaViewModeEntry,getPrivateViewModeEntry,getMemberDataTextViewModeEntry} from "/apogeejs-app-lib/src/datasource/standardDataDisplay.js";
import VanillaViewModeElement from "/apogeejs-app-lib/src/datadisplay/VanillaViewModeElement.js";

/** This attempt has a single form edit page which returns an object. */
// To add - I should make it so it does not call set data until after it is initialized. I will cache it rather 
//than making the user do that.
/** This method creates the resource. */
function onUiCodeUpdate(component,uiGeneratorBody) {
    var resource;
    if((uiGeneratorBody)&&(uiGeneratorBody.length > 0)) {
        //compile the user code for the generator
        var generatorFunction;
        try {
            generatorFunction = new Function(uiGeneratorBody);
        }
        catch(error) {
            resource = {
                displayInvalid: true,
                message: "Error parsing uiGenerator code: " + error.toString()
            }
            if(error.stack) console.error(error.stack);
            generatorFunction = null;
        }

        //execute the generator function
        if(generatorFunction) {
            try {
                resource = generatorFunction();
            }
            catch(error) {
                resource = {
                    displayInvalid: true,
                    message: "Error executing uiGenerator code: " + error.toString()
                }
                if(error.stack) console.error(error.stack);
            }
        }
    }
    else {
        //generator not yet present
        resource = {};
    }

    component.setField("resource",resource);
}

///////////////////////////////////////////////////////
// view code
////////////////////////////////////////////////////////


//========================
// CSS CODE - needs to be fixed
//========================
// constructor(appViewInterface,component,viewConfig) {
//     //extend edit component
//     super(appViewInterface,component,viewConfig);

//     //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//     //add css to page! I think this should go in a separate on create event, but until I 
//     //make this, I iwll put this here.
//     let css = component.getField("css");
//     if((css)&&(css != "")) {
//         uiutil.setObjectCssData(component.getId(),css);
//     }
//     //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// };

// /** This component overrides the componentupdated to process the css data, which is managed directly in the view. */
// componentUpdated(component) {
//     super.componentUpdated(component);

//     //if this is the css field, set it immediately
//     if(component.isFieldUpdated("css")) {
//         uiutil.setObjectCssData(component.getId(),component.getField("css"));
//     }
// }

// /** This component extends the on delete method to get rid of any css data for this component. */
// onDelete() {
//     //remove the css data for this component
//     uiutil.setObjectCssData(this.component.getId(),"");
    
//     super.onDelete();
// }

function getOutputDataDisplay() {
    //displayContainer.setDestroyViewOnInactive(component.getField("destroyOnInactive"));
    var dataDisplaySource = getOutputDataDisplaySource();
    return new HtmlJsDataDisplay(dataDisplaySource);
}

function getOutputDataDisplaySource() {
    return {

        //This method reloads the component and checks if there is a DATA update. UI update is checked later.
        doUpdate: (component) => {
            //return value is whether or not the data display needs to be udpated
            let reloadData = component.isMemberDataUpdated("member.data");
            let reloadDataDisplay = component.areAnyFieldsUpdated(["html","uiCode","member.input"]);
            return {reloadData,reloadDataDisplay};
        },

        getDisplayData: (component) => dataDisplayHelper.getWrappedMemberData(component,"member.input"),

        getData: (component) => dataDisplayHelper.getWrappedMemberData(component,"member.data"),

        //edit ok - always true
        getEditOk: (component) => {
            return true;
        },

        saveData: (formValue,component) => {
            //send value to the member whose variable name is "data"
            //the scope reference is the member called "input" 
            let runContextLink = component.getApp().getWorkspaceManager().getRunContextLink();
            let inputMember = component.getField("member.input");
            let messenger = new Messenger(runContextLink,inputMember.getId());
            messenger.dataUpdate("data",formValue);
            return true;
        },

        //below - custom methods for HtmlJsDataDisplay

        //returns the HTML for the data display
        getHtml: (component) => {
            return component.getField("html");
        },

        //returns the resource for the data display
        getResource: (component) => {
            return component.getField("resource");
        },

        //gets the mebmer used as a refernce for the UI manager passed to the resource functions 
        getScopeMember: (component) => {
            let inputMember = component.getField("member.input");
            return inputMember;
        }
    }
}



//======================================
// This is the control config, to register the control
//======================================

const CustomDataComponentConfig = {
    componentClass: Component,
    displayName: "Custom Data Cell",
    defaultMemberJson: {
        "type": "apogee.Folder",
        "childrenNotWriteable": true,
        "children": {
            "input": {
                "name": "input",
                "type": "apogee.DataMember",
                "fields": {
                    "data":"",
                }
            },
            "data": {
                "name": "data",
                "type": "apogee.DataMember",
                "fields": {
                    "data": "",
                }
            }
        }
    },
    defaultComponentJson: {
        type: "apogeeapp.CustomDataCell",
        fields: {
            destroyOnInactive: false,
            html: "",
            css: "",
            uiCode: ""
        }
    },
    fieldFunctions: {
		uiCode: {
			fieldChangeHandler: onUiCodeUpdate 
		}
	},

    iconResPath: "/icons3/genericCellIcon.png",
    propertyDialogEntries: [
        {
            propertyKey: "destroyOnInactive",
            dialogElement: {
                "type":"checkbox",
                "label":"Destroy on Hide: ",
                "key":"destroyOnInactive"
            }
        }
    ],
    viewModes: [
        getErrorViewModeEntry(),
        {
            name: "Display", 
            label: "Display", 
            isActive: true,
            getViewModeElement: (component,showing) => <VanillaViewModeElement
				component={component}
				getDataDisplay={getOutputDataDisplay}
				showing={showing} />

        },
        getAppCodeViewModeEntry("html",null,"HTML","HTML",{sourceType: "data", textDisplayMode: "ace/mode/html"}),
        getAppCodeViewModeEntry("css",null,"CSS", "CSS",{sourceType: "data", textDisplayMode: "ace/mode/css"}),
        getAppCodeViewModeEntry("uiCode",null,"uiGenerator()","UI Generator"),
        getFormulaViewModeEntry("member.input","Input Code","Input Code"),
        getPrivateViewModeEntry("member.input","Input Private","Input Private"),
        getMemberDataTextViewModeEntry("member.data",{name: "Data Value",label: "Data Value"})
    ]
}
export default CustomDataComponentConfig;


