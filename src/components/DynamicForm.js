import Component from "/apogeejs-app-lib/src/component/Component.js";

import ConfigurableFormEditor from "/apogeejs-view-lib/src/datadisplay/ConfigurableFormEditor.js";
import {getErrorViewModeEntry,getFormulaViewModeEntry,getPrivateViewModeEntry} from "/apogeejs-view-lib/src/datasource/standardDataDisplay.js";
import dataDisplayHelper from "/apogeejs-view-lib/src/datadisplay/dataDisplayHelper.js";

///////////////////////////////////////////////////////
// view code
////////////////////////////////////////////////////////


function getFormViewDisplay(componentHolder, displayContainer) {
    let dataDisplaySource = getFormCallbacks(componentHolder);
    return new ConfigurableFormEditor(displayContainer,dataDisplaySource);
}

function getFormCallbacks(componentHolder) { 
    var dataDisplaySource = {
        doUpdate: () => {
            //we have no data here, just the form layout
            let reloadData = false;
            let reloadDataDisplay = componentHolder.getComponent().isMemberDataUpdated("member");
            return {reloadData,reloadDataDisplay};
        },

        getDisplayData: () => dataDisplayHelper.getWrappedMemberData(componentHolder.getComponent(),"member"),

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
            getDataDisplay: (componentHolder,displayContainer) => getFormViewDisplay(componentHolder,displayContainer)
        },
        getFormulaViewModeEntry("member",{name:"Input Code",label:"Layout Code",argList:""}),
        getPrivateViewModeEntry("member",{name:"Input Private",label:"Layout Private"}),
    ],
    iconResPath: "/icons3/formCellIcon.png"
}
export default DynamicFormConfig;