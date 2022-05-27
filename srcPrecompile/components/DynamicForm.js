import Component from "/apogeejs-app-lib/src/component/Component.js";

import ConfigurableFormEditor from "/apogeejs-app-lib/src/datadisplay/ConfigurableFormEditor.js";
import {getErrorViewModeEntry,getFormulaViewModeEntry,getPrivateViewModeEntry} from "/apogeejs-app-lib/src/datasource/standardDataDisplay.js";
import dataDisplayHelper from "/apogeejs-app-lib/src/datadisplay/dataDisplayHelper.js";
import VanillaViewModeElement from "/apogeejs-app-lib/src/datadisplay/VanillaViewModeElement.js";

///////////////////////////////////////////////////////
// view code
////////////////////////////////////////////////////////


function getFormViewDisplay() {
    let dataDisplaySource = getFormCallbacks();
    return new ConfigurableFormEditor(dataDisplaySource);
}

function getFormCallbacks() { 
    var dataDisplaySource = {
        doUpdate: (component) => {
            //we have no data here, just the form layout
            let reloadData = false;
            let reloadDataDisplay = component.isMemberDataUpdated("member");
            return {reloadData,reloadDataDisplay};
        },

        getDisplayData: () => dataDisplayHelper.getWrappedMemberData(component,"member"),

        getData: () => { return {"data": null}; },
    }

    return dataDisplaySource;
}

//Cnfig

const DynamicFormConfig = {
	componentClass: Component,
	displayName: "Legacy Action Form Cell (deprecated)",
	defaultMemberJson: {
		"type": "apogee.DataMember"
	},
	defaultComponentJson: {
		type: "apogeeapp.ActionFormCell"
	},

    viewModes: [
        getErrorViewModeEntry(),
        {
            name: "Form",
            label: "Form",
            isActive: true,
            getViewModeElement: (component,showing) => <VanillaViewModeElement
                component={component}
                getDataDisplay={getFormViewDisplay}
                showing={showing} />
        },
        getFormulaViewModeEntry("member",{name:"Input Code",label:"Layout Code",argList:""}),
        getPrivateViewModeEntry("member",{name:"Input Private",label:"Layout Private"}),
    ],
    iconResPath: "/icons3/formCellIcon.png"
}
export default DynamicFormConfig;