import Component from "/apogeejs-app-lib/src/component/Component.js";
import {getFormComponentDefaultMemberJson} from "/apogeejs-app-lib/src/components/formInputComponentUtils.js";
import {defineHardcodedDataMember} from "/apogeejs-model-lib/src/apogeeModelLib.js";

import {getConfigViewModeEntry} from "/apogeejs-app-lib/src/components/FormInputBaseComponentView.js";
import ConfigurableFormEditor from "/apogeejs-app-lib/src/datadisplay/ConfigurableFormEditor.js";
import dataDisplayHelper from "/apogeejs-app-lib/src/datadisplay/dataDisplayHelper.js";
import {ConfigurablePanel} from "/apogeejs-ui-lib/src/apogeeUiLib.js"
import VanillaViewModeElement from "/apogeejs-app-lib/src/datadisplay/VanillaViewModeElement.js";

const DATA_MEMBER_FUNCTION_BODY = `
if(formResult) return apogeeui.ConfigurablePanel.getGeneratedFormLayout(formResult);
else return [];
`

///////////////////////////////////////////////////////
// view code
////////////////////////////////////////////////////////


/** This method returns the form layout.
 * @protected. */
 function getFormLayout(component) {
    let flags = {
        "inputExpressions": component.getField("allowInputExpressions")
    }
    return ConfigurablePanel.getFormDesignerLayout(flags);
}

function getFormViewDataDisplay(component) {
    let dataDisplaySource = _getOutputFormDataSource(component);
    return new ConfigurableFormEditor(component,dataDisplaySource);
}

function _getOutputFormDataSource() {

    return {
        //This method reloads the component and checks if there is a DATA update. UI update is checked later.
        doUpdate: (component) => {
            //return value is whether or not the data display needs to be udpated
            let reloadData = false;
            let reloadDataDisplay = component.isMemberFieldUpdated("data.member","data");
            return {reloadData,reloadDataDisplay};
        },

        getDisplayData: (component) => dataDisplayHelper.getWrappedMemberData(component,"data.member"),

        getData: (component) => { return {"data": null}; },

        getEditOk: (component) => false
    }
}


//this defines the hardcoded type we will use
const dataMemberTypeName = "apogee.DesignerActionFormMember";
defineHardcodedDataMember(dataMemberTypeName,DATA_MEMBER_FUNCTION_BODY);
const DesignerActionFormComponentConfig = {
    componentClass: Component,
    displayName: "Action Form Cell",
    defaultMemberJson: getFormComponentDefaultMemberJson(dataMemberTypeName),
    defaultComponentJson: {
        type: "apogeeapp.DesignerActionFormCell",
        fields: {
            allowInputExpressions: true
        }
    },

    viewModes: [
        {
            name: "Form",
            label: "Form", 
            isActive: true,
            getViewModeElement: (component,showing,setEditModeData,setMsgData,size,setSizeCommandData) => <VanillaViewModeElement
				component={component}
				getDataDisplay={getFormViewDataDisplay}
                setEditModeData={setEditModeData}
                setMsgData={setMsgData}
				showing={showing} 
                size={size}
                setSizeCommandData={setSizeCommandData} />

        },
        getConfigViewModeEntry(getFormLayout,"Form Designer")
    ],
    iconResPath: "/icons3/formCellIcon.png",
    propertyDialogEntries: [
        {
            propertyKey: "allowInputExpressions",
            dialogElement: {
                "type":"checkbox",
                "label":"Allow Designer Input Expressions: ",
                "value": true,
                "key":"allowInputExpressions"
            }
        }
    ]
}
export default DesignerActionFormComponentConfig;


