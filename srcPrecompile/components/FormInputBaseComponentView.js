
import ConfigurableFormEditor from "/apogeejs-app-lib/src/datadisplay/ConfigurableFormEditor.js";
import VanillaViewModeElement from "/apogeejs-app-lib/src/datadisplay/VanillaViewModeElement.js";
import { ConfigurablePanel } from "/apogeejs-ui-lib/src/apogeeUiLib.js";


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
        let stateUpdated = false
        let displayState, dataState, saveFunction

        //display state
        if( !oldSourceState || (getFormLayoutUpdated && getFormLayoutUpdated(component)) ) {
            stateUpdated = true
            displayState = {layout: getFormLayout(component)}
        }
        else {
            displayState = oldSourceState.displayState
        }

        //data state
        if( !oldSourceState || formDataMember.isFieldUpdated("data") ) {
            stateUpdated = true
            dataState = {
                data: formDataMember.getData(),
                editOk: true
            }
        }
        else {
            dataState = oldSourceState.dataState
        }

        //save function
        if( !oldSourceState || component.isMemberDataUpdated("isInputValid.member") ) {
            stateUpdated = true
            let layout = displayState.layout
            saveFunction = _getOnSubmit(component,layout)
        }
        else {
            saveFunction = oldSourceState.save
        }

        if(stateUpdated) {
            return {
                displayState: displayState,
                dataState: dataState,
                save: saveFunction
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
function _getOnSubmit(component,formLayout) {

    let app = component.getApp()
    let dataMemberId = component.getField("formData.member").getId()
    let resultMemberId = component.getField("formResult.member").getId()

    return (formValue) => {

        var dataCommand = {};
        dataCommand.type = "saveMemberData";
        dataCommand.memberId = dataMemberId;
        dataCommand.data = formValue;
        
        var resultCommand = {};

        let hasExpression = true //implement this!!!

        if(hasExpression) {
            //save compiled form code
            let functionBody = ConfigurablePanel.getResultFunctionBody(formValue,formLayout)
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