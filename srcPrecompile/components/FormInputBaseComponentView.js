
import ConfigurableFormEditor from "/apogeejs-app-lib/src/datadisplay/ConfigurableFormEditor.js";
import dataDisplayHelper from "/apogeejs-app-lib/src/datadisplay/dataDisplayHelper.js";
import VanillaViewModeElement from "/apogeejs-app-lib/src/datadisplay/VanillaViewModeElement.js";
import { FormResultFunctionGenerator } from "/apogeejs-ui-lib/src/apogeeUiLib.js";


//TO DO
// - ?: formLayoutHasError, formLayoutErrorChanged
// - ?: isInputValid() function added

function getSourceState(component,oldSourceState,getFormLayout,getFormLayoutUpdated) {

    let formDataMember = component.getField("formData.member")

    if(formDataMember.getState() != apogeeutil.STATE_NORMAL) {
        //handle non-normal state - error, pending, invalid value
        if ( !oldSourceState || component.isStateUpdated() ) {
            return {
                hideDisplay: true,
                messageType: DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_INFO,
                message: "Data Unavailable"
            }
        }
        else {
            return oldSourceState
        }
        
    }
    else {
        //handle normal state
        let displayStateUpdated, dataStateUpdated, saveFunctionUpdated
        let displayState, dataState, saveFunction

        //display state
        if( !oldSourceState || (getFormLayoutUpdated && getFormLayoutUpdated(component)) ) {
            displayStateUpdated = true
            displayState = {layout: getFormLayout(component)}
        }
        else {
            displayStateUpdated = false
        }

        //data state
        if( !oldSourceState || formDataMember.isFieldUpdated("data") ) {
            dataStateUpdated = true
            dataState = {
                data: formDataMember.getData(),
                editOk: true
            }
        }
        else {
            dataStateUpdated = false
        }

        //save function
        if( !oldSourceState || component.isMemberDataUpdated("isInputValid.member") ) {
            saveFunctionUpdated = true
            saveFunction = _getOnSubmit(component)
        }

        if( displayStateUpdated || dataStateUpdated || saveFunctionUpdated ) {
            return {
                displayState: displayStateUpdated ? displayState : oldSourceState.displayState,
                dataState: dataStateUpdated ? dataState : oldSourceState.dataState,
                save: saveFunctionUpdated ? saveFunction : oldSourceState.save,
            }
        }
        else {
            return oldSourceState
        }

    }
}

// /** This is the data source for the input form data display */
// function _getInputFormDataSource(getFormLayout) {
//     return {
//         doUpdate: (component) => {
//             //data updates should only be triggered by the form itself
//             let reloadData = component.isMemberDataUpdated("formData.member");
//             //form layout constant
//             let reloadDataDisplay = false;
//             return {reloadData,reloadDataDisplay};
//         }, 
//         getDisplayData: (component) => {
//             return {
//                 data: getFormLayout(component)
//             }
//         },
//         getData: (component) => dataDisplayHelper.getWrappedMemberData(component,"formData.member"),
//         getEditOk: () => true,
//         saveData: (formData,component,dataDisplay) => _onSubmit(component,formData,dataDisplay)
//     }
// }

/** This method saves the form result converted to a function body that handles expression inputs.
 * This is saved to the formula for the member object. */
function _getOnSubmit(component) {

    let app = component.getApp()
    let dataMemberId = component.getField("formData.member").getId()
    let resultMemberId = component.getField("formResult.member").getId()

    return (formData,formEditor) => {
        //load the form meta - we have to look it up from the data display (this is a little clumsy)
        let formMeta;
        if(formEditor) {
            formMeta = formEditor.getFormMeta();
        }

        // if(!formMeta) {
        //     //data display should be present if the person submitted the form
        //     console.error("Unknown error loading the form meta value.");
        //     //return true indicates the submit is completed
        //     return true;
        // }
        if(!formMeta) formMeta = {}

        var dataCommand = {};
        dataCommand.type = "saveMemberData";
        dataCommand.memberId = dataMemberId;
        dataCommand.data = formData;

        //set the form result value, either using the compiled function or the plain form value as is appropriate
        let functionGenerator = new FormResultFunctionGenerator();
        functionGenerator.setInput(formData,formMeta);
        
        var resultCommand = {};

        if(functionGenerator.getHasExpressions()) {
            //save compiled form code
            let functionBody = functionGenerator.getFunctionBody(formData,formMeta)
            resultCommand.type = "saveMemberCode"
            resultCommand.memberId = resultMemberId
            resultCommand.argList = []
            resultCommand.functionBody = functionBody
            resultCommand.supplementalCode = ""
        }
        else {
            //save plain form value
            resultCommand.type = "saveMemberData"
            resultCommand.memberId = resultMemberId
            resultCommand.data = formData
        }

        let command = {
            type: "compoundCommand",
            childCommands: [dataCommand,resultCommand]
        }
        
        app.executeCommand(command);

        //if we got this far the form save should be accepted
        return true;
    }
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
        getSourceState: (component,oldSourseState) => getSourceState(component,oldSourseState,getFormLayout),
        getViewModeElement: (sourceState,inEditMode,setEditModeData,verticalSize,cellShowing) => <VanillaViewModeElement
            displayState={sourceState.displayState}
            dataState={sourceState.dataState}
            hideDisplay={sourceState.hideDisplay}
            save={sourceState.save}
            inEditMode={inEditMode}
            setEditModeData={setEditModeData}
            verticalSize={verticalSize}
            cellShowing={cellShowing}
            getDataDisplay={displayState => new ConfigurableFormEditor(displayState)} />
    }
}