import Component from "/apogeejs-app-lib/src/component/Component.js";

import ConfigurableFormEditor from "/apogeejs-app-lib/src/datadisplay/ConfigurableFormEditor.js";
import {getErrorViewModeEntry,getFormulaViewModeEntry,getPrivateViewModeEntry} from "/apogeejs-app-lib/src/datasource/standardDataDisplay.js";
import dataDisplayHelper from "/apogeejs-app-lib/src/datadisplay/dataDisplayHelper.js";
import VanillaViewModeElement from "/apogeejs-app-lib/src/datadisplay/VanillaViewModeElement.js";

///////////////////////////////////////////////////////
// view code
////////////////////////////////////////////////////////


function getFormViewDisplay(component) {
    let dataDisplaySource = getFormCallbacks();
    return new ConfigurableFormEditor(component,dataDisplaySource);
}

function getFormCallbacks() { 
    var dataDisplaySource = {
        doUpdate: (component) => {
            //we have no data here, just the form layout
            let reloadData = false;
            let reloadDataDisplay = component.isMemberDataUpdated("member");
            return {reloadData,reloadDataDisplay};
        },

        getDisplayData: (component) => dataDisplayHelper.getWrappedMemberData(component,"member"),

        getData: (component,) => { return {"data": null}; },
    }

    return dataDisplaySource;
}

//Cnfig

const DynamicFormConfig = {
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
            getViewModeElement: (component,showing,setEditModeData,setMsgData,size,setSizeCommandData) => <VanillaViewModeElement
				component={component}
				getDataDisplay={getFormViewDisplay}
                setEditModeData={setEditModeData}
                setMsgData={setMsgData}
				showing={showing} 
                size={size}
                setSizeCommandData={setSizeCommandData} />
        },
        getFormulaViewModeEntry("member",{name:"Input Code",label:"Layout Code",argList:""}),
        getPrivateViewModeEntry("member",{name:"Input Private",label:"Layout Private"}),
    ],
    iconResPath: "/icons3/formCellIcon.png"
}
export default DynamicFormConfig;