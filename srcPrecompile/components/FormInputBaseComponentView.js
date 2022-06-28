
import ConfigurableFormEditor from "/apogeejs-app-lib/src/datadisplay/ConfigurableFormEditor.js";
import dataDisplayHelper from "/apogeejs-app-lib/src/datadisplay/dataDisplayHelper.js";
import VanillaViewModeElement from "/apogeejs-app-lib/src/datadisplay/VanillaViewModeElement.js";
import { FormResultFunctionGenerator } from "/apogeejs-ui-lib/src/apogeeUiLib.js";


function _getFormDataDisplay(component,getFormLayout) {
    let dataDisplaySource = _getInputFormDataSource(getFormLayout);
    return new ConfigurableFormEditor(component,dataDisplaySource);
}

/** This is the data source for the input form data display */
function _getInputFormDataSource(getFormLayout) {
    return {
        doUpdate: (component) => {
            //data updates should only be triggered by the form itself
            let reloadData = component.isMemberDataUpdated("member.formData");
            //form layout constant
            let reloadDataDisplay = false;
            return {reloadData,reloadDataDisplay};
        }, 
        getDisplayData: (component) => {
            return {
                data: getFormLayout(component)
            }
        },
        getData: (component) => dataDisplayHelper.getWrappedMemberData(component,"member.formData"),
        getEditOk: () => true,
        saveData: (formData,component,dataDisplay) => _onSubmit(component,formData,dataDisplay)
    }
}

/** This method saves the form result converted to a function body that handles expression inputs.
 * This is saved to the formula for the member object. */
function _onSubmit(component, formData, formEditor) {
    //load the form meta - we have to look it up from the data display (this is a little clumsy)
    let formMeta;
    if(formEditor) {
        formMeta = formEditor.getFormMeta();
    }

    if(!formMeta) {
        //data display should be present if the person submitted the form
        console.error("Unknown error loading the form meta value.");
        //return true indicates the submit is completed
        return true;
    }

    //set the form data value
    var dataMember = component.getField("member.formData");

    var dataCommand = {};
    dataCommand.type = "saveMemberData";
    dataCommand.memberId = dataMember.getId();
    dataCommand.data = formData;

    //set the form result value, either using the compiled function or the plain form value as is appropriate
    let functionGenerator = new FormResultFunctionGenerator();
    functionGenerator.setInput(formData,formMeta);
    
    var resultMember = component.getField("member.formResult");
    var resultCommand = {};

    if(functionGenerator.getHasExpressions()) {
        //save compiled form code
        let functionBody = functionGenerator.getFunctionBody(formData,formMeta);
        resultCommand.type = "saveMemberCode";
        resultCommand.memberId = resultMember.getId();
        resultCommand.argList = [];
        resultCommand.functionBody = functionBody;
        resultCommand.supplementalCode = "";
    }
    else {
        //save plain form value
        resultCommand.type = "saveMemberData";
        resultCommand.memberId = resultMember.getId();
        resultCommand.data = formData;
    }

    let command = {
        type: "compoundCommand",
        childCommands: [dataCommand,resultCommand]
    }
    
    component.getApp().executeCommand(command);

    //if we got this far the form save should be accepted
    return true;
}       


let VIEW_INPUT = "Input";

/** This function returns the view mode entry for the Config entry. This includes an option to change the name of the view. 
 * getFormLayout is a function with the arguments getFormLayout(component) that returns the form layout
*/
export function getConfigViewModeEntry(getFormLayout,optionalAlternateLabel) {
    return {
        name: VIEW_INPUT,
        label: optionalAlternateLabel ? optionalAlternateLabel : "Configuration",
        isActive: true,
        getViewModeElement: (component,showing,setEditModeData,setMsgData,size,setSizeCommandData) => <VanillaViewModeElement
				component={component}
				getDataDisplay={component => _getFormDataDisplay(component,getFormLayout)}
                setEditModeData={setEditModeData}
                setMsgData={setMsgData}
				showing={showing} 
                size={size}
                setSizeCommandData={setSizeCommandData} />
    }
}