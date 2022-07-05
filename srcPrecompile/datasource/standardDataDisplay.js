import dataDisplayHelper from "/apogeejs-app-lib/src/datadisplay/dataDisplayHelper.js";
import AceTextEditor from "/apogeejs-app-lib/src/datadisplay/AceTextEditor.js";
import {StandardErrorElement,getStandardErrorSourceState,isErrorElementRemoved} from "/apogeejs-app-lib/src/datadisplay/StandardErrorDisplay.js";
import DATA_DISPLAY_CONSTANTS from "/apogeejs-app-lib/src/datadisplay/dataDisplayConstants.js";
import VanillaViewModeElement from "/apogeejs-app-lib/src/datadisplay/VanillaViewModeElement.js";

//============================
//Component Error View Mode
//============================
export function getErrorViewModeEntry() {
    return {
        name: "Info", //unfortunate legacy name
        label: "Error Info",
        isActive: false,
        isTransient: true,
        isErrorView: true,
        getSourceState: getStandardErrorSourceState,
        getViewModeElement: (sourceState,inEditMode,setEditModeData,verticalSize,cellShowing) => 
            <StandardErrorElement dataState={sourceState.dataState} cellShowing={cellShowing} />,
        isViewRemoved: isErrorElementRemoved
    }
}

//=============================
// Member Data View Modes
//=============================


export function getJsonDataSourceState(component,memberFieldName,oldSourceState,doReadOnly,getFormatIsValid,formatInvalidMessage) {

    let member = component.getField(memberFieldName)
    if(member.getState() != apogeeutil.STATE_NORMAL) {
        let sourceState = {}
        sourceState.dataState = {data: apogeeutil.INVALID_VALUE}
        sourceState.hideDisplay = true
        sourceState.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_INFO
        sourceState.message = "Data Unavailable"
        return sourceState
    }
    else {
        let dataState, saveFunction
        let dataStateUpdated, saveFunctionUpdated

        let editOk = !doReadOnly && !member.hasCode() //do not edit data if member has code

        let data = member.getData()

        //check for invalid data (data that can not properly be showin in data display)
        if(getFormatIsValid && !getFormatIsValid(data)) {
            let sourceState = {}
            sourceState.dataState = {data: apogeeutil.INVALID_VALUE}
            sourceState.hideDisplay = true
            sourceState.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_INFO
            sourceState.message = formatInvalidMessage ? formatInvalidMessage : "Data can not be displayed: invalid format"
            return sourceState
        }

        //data state
        if( !oldSourceState || member.isFieldUpdated("data") ) {
            dataStateUpdated = true
            dataState = {
                data: member.getData(),
                editOk: editOk
            }
        }
        
        //save function
        if(editOk) {
            if( !oldSourceState) {
                saveFunctionUpdated = true

                let app = component.getApp()
                let memberId = member.getId()

                saveFunction = json => { 
                    var commandData = {}
                    commandData.type = "saveMemberData"
                    commandData.memberId = memberId
                    commandData.data = json
                    
                    app.executeCommand(commandData)
                    return true
                }
            }
        }

        //source state
        if(dataStateUpdated || saveFunctionUpdated) {
            return {
                dataState: dataStateUpdated ? dataState : oldSourceState.dataState,
                save: editOk ? (saveFunctionUpdated ? saveFunction : oldSourceState.save) : undefined
            }
        }
        else {
            return oldSourceState
        }
    }
}

export function getStringifiedJsonDataSourceState(component,memberFieldName,oldSourceState,doReadOnly) {

    let member = component.getField(memberFieldName)
    
    //special consideration for unparsed data (when we have a parsing error on input)
    let memberError = (member.getState() == apogeeutil.STATE_ERROR) ? member.getError() : null
    let unparsedData = memberError ? memberError.unparsedData : null

    if( (member.getState() != apogeeutil.STATE_NORMAL) && (unparsedData === null) ) {
        let sourceState = {}
        sourceState.dataState = {data: apogeeutil.INVALID_VALUE}
        sourceState.hideDisplay = true
        sourceState.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_INFO
        sourceState.message = "Data Unavailable"
        return sourceState
    }
    else {
        let dataState, saveFunction
        let dataStateUpdated, saveFunctionUpdated

        let editOk = !doReadOnly && !member.hasCode() //do not edit data if member has code

        //data state
        if( !oldSourceState || ((unparsedData !== null)&&(member.isFieldUpdated("state"))) ) {
            //data for parse error
            dataStateUpdated = true
            dataState = {
                data: unparsedData,
                editOk: editOk
            }
        }
        if( !oldSourceState || ((unparsedData === null)&&(member.isFieldUpdated("data"))) ) {
            //normal data
            dataStateUpdated = true

            let data = member.getData()
            let editOk = !doReadOnly && !member.hasCode() //no edit value if the member has code
            try {
                dataState = {
                    data: apogeeutil.stringifyJsonData(data),
                    editOk: editOk
                }
            }
            catch(error) {
                let sourceState = {}
                sourceState.dataState = {data: apogeeutil.INVALID_VALUE}
                sourceState.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_ERROR
                sourceState.message = "Error converting data to text: " + error.toString()
                return sourceState
            }
        }
        
        //save function
        if(editOk) {
            if( !oldSourceState) {
                saveFunctionUpdated = true

                let app = component.getApp()
                let memberId = member.getId()

                saveFunction = text => {
                    let returnErrorAsData = true //this means an Error is returned rather than thrown
                    let data = apogeeutil.parseJsonData(text,returnErrorAsData) //this will handle recording a parse error properly
                    
                    var commandData = {}
                    commandData.type = "saveMemberData"
                    commandData.memberId = memberId
                    commandData.data = data
                    
                    app.executeCommand(commandData)
                    return true
                }
            }
        }

        //source state
        if(dataStateUpdated || saveFunctionUpdated) {
            return {
                dataState: dataStateUpdated ? dataState : oldSourceState.dataState,
                save: editOk ? (saveFunctionUpdated ? saveFunction : oldSourceState.save) : undefined
            }
        }
        else {
            return oldSourceState
        }
    }
}

export function getMemberStringifiedJsonViewModeEntry(memberFieldName,options) {
    //derive default suffix from memberFieldName
    //display logic will apply the suffix if it is not falsy (at time this comment added)
    let suffix; 
    if((options)&&(options.suffix !== undefined)) {
        suffix = options.suffix
    }
    else {
        if(memberFieldName.endsWith(".member")) {
            suffix = memberFieldName.slice(0,-".member".length);
        }
        else {
            suffix = null;
        }
    }

    let doReadOnly = ((options)&&(options.editorOptions)) ? options.editorOptions.doReadOnly : false;
    let editorOptions = ((options)&&(options.editorOptions)) ? options.editorOptions : AceTextEditor.OPTION_SET_DISPLAY_SOME;

    return {
        name: ((options)&&(options.name)) ? options.name : "Value",
        label: ((options)&&(options.label)) ? options.label : "Value",
        sourceLayer: "model",
        sourceType: "data",
        suffix: suffix, //default value comes from member field name 
        isActive: ((options)&&(options.suffix)) ? options.suffix : false,
        getSourceState: (component,oldSourceState) => getStringifiedJsonDataSourceState(component,memberFieldName,oldSourceState,doReadOnly),
        getViewModeElement: (sourceState,inEditMode,setEditModeData,verticalSize,cellShowing) => <VanillaViewModeElement
                displayState={sourceState.displayState}
                dataState={sourceState.dataState}
                hideDisplay={sourceState.hideDisplay}
                save={sourceState.save}
                inEditMode={inEditMode}
                setEditModeData={setEditModeData}
                verticalSize={verticalSize}
                cellShowing={cellShowing}
                getDataDisplay={displayState => new AceTextEditor("ace/mode/json",editorOptions)} />,
        sizeCommandInfo: AceTextEditor.SIZE_COMMAND_INFO
    }
}

//==============================
// Member Code View Modes
//==============================
export function getFormulaSourceState(component,memberFieldName,oldSourceState) {

    let dataState, saveFunction
    let dataStateUpdated, saveFunctionUpdated

    let member = component.getField(memberFieldName)

    //function body
    if( !oldSourceState || member.isFieldUpdated("functionBody") ) {
        dataState = {
            data: member.getFunctionBody(),
            editOk: true
        }
        dataStateUpdated = true
    }
    else {
        dataState = oldSourceState.dataState
    }

    //save
    if( !oldSourceState || component.areAnyMemberFieldsUpdated(memberFieldName,["argList","functionBody","supplementalCode"]) ) {
        let app = component.getApp()
        let memberId = member.getId()
        let argList = member.getArgList()
        let privateCode = member.getSupplementalCode()

        saveFunction = functionBody => { 
            var commandData = {}
            commandData.type = "saveMemberCode"
            commandData.memberId = memberId
            commandData.argList = argList
            commandData.functionBody = functionBody
            commandData.supplementalCode = privateCode;
            
            app.executeCommand(commandData)
            return true
        }
        saveFunctionUpdated = true
    }
    else {
        saveFunction = oldSourceState.save
        saveFunctionUpdated = false
    }

    //combine
    if( dataStateUpdated || saveFunctionUpdated) {
        return {
            dataState: dataStateUpdated ? dataState : oldSourceState.dataState,
            save: saveFunctionUpdated ? saveFunction : oldSourceState.save,
        }
    }
    else {
        return oldSourceState
    }

}

export function getFormulaViewModeEntry(memberFieldName,options) {
    let editorOptions = ((options)&&(options.editorOptions)) ? options.editorOptions : AceTextEditor.OPTION_SET_DISPLAY_MAX

    return {
        name: ((options)&&(options.name)) ? options.name : "Formula",
        label: ((options)&&(options.label)) ? options.label : "Formula",
        sourceLayer: "model",
        sourceType: "function",
        argList: ((options)&&(options.argList !== undefined)) ? options.argList : "",
        isActive: ((options)&&(options.isActive)) ? options.isActive : false,
        getSourceState:  (component,oldSourceState) => getFormulaSourceState(component,memberFieldName,oldSourceState),
        getViewModeElement: (sourceState,inEditMode,setEditModeData,verticalSize,cellShowing) => <VanillaViewModeElement
                displayState={sourceState.displayState}
                dataState={sourceState.dataState}
                hideDisplay={sourceState.hideDisplay}
                save={sourceState.save}
                inEditMode={inEditMode}
                setEditModeData={setEditModeData}
                verticalSize={verticalSize}
                cellShowing={cellShowing}
                getDataDisplay={displayState => new AceTextEditor("ace/mode/javascript",editorOptions)} />,
        sizeCommandInfo: AceTextEditor.SIZE_COMMAND_INFO
    }
}

export function getPrivateCodeSourceState(component,memberFieldName,oldSourceState) {
    
    let dataState, saveFunction
    let dataStateUpdated, saveFunctionUpdated

    let member = component.getField(memberFieldName)

    //function body
    if( !oldSourceState || member.isFieldUpdated("supplementalCode") ) {
        dataState = {
            data: member.getSupplementalCode(),
            editOk: true
        }
        dataStateUpdated = true
    }
    else {
        dataState = oldSourceState.dataState
    }

    //save
    if( !oldSourceState || component.areAnyMemberFieldsUpdated(memberFieldName,["argList","functionBody","supplementalCode"]) ) {
        let app = component.getApp()
        let memberId = member.getId()
        let argList = member.getArgList()
        let functionBody = member.getFunctionBody()

        saveFunction = privateCode => { 
            var commandData = {}
            commandData.type = "saveMemberCode"
            commandData.memberId = memberId
            commandData.argList = argList
            commandData.functionBody = functionBody
            commandData.supplementalCode = privateCode;
            
            app.executeCommand(commandData)
            return true
        }
        saveFunctionUpdated = true
    }
    else {
        saveFunction = oldSourceState.save
        saveFunctionUpdated = false
    }

    //combine
    if( dataStateUpdated || saveFunctionUpdated) {
        return {
            dataState: dataStateUpdated ? dataState : oldSourceState.dataState,
            save: saveFunctionUpdated ? saveFunction : oldSourceState.save,
        }
    }
    else {
        return oldSourceState
    }
}

export function getPrivateViewModeEntry(memberFieldName,options) {

    let editorOptions = ((options)&&(options.editorOptions)) ? options.editorOptions : AceTextEditor.OPTION_SET_DISPLAY_MAX

    return {
        name: ((options)&&(options.name)) ? options.name : "Private",
        label: ((options)&&(options.label)) ? options.label : "Private",
        sourceLayer: "model",
        sourceType: "private code",
        isActive: ((options)&&(options.isActive)) ? options.isActive : false,
        getSourceState: (component,oldSourceState) => getPrivateCodeSourceState(component,memberFieldName,oldSourceState),
        getViewModeElement: (sourceState,inEditMode,setEditModeData,verticalSize,cellShowing) => <VanillaViewModeElement
                displayState={sourceState.displayState}
                dataState={sourceState.dataState}
                hideDisplay={sourceState.hideDisplay}
                save={sourceState.save}
                inEditMode={inEditMode}
                setEditModeData={setEditModeData}
                verticalSize={verticalSize}
                cellShowing={cellShowing}
                getDataDisplay={displayState => new AceTextEditor("ace/mode/javascript",editorOptions)} />,
        sizeCommandInfo: AceTextEditor.SIZE_COMMAND_INFO
    }
} 

//============================================
// App Code/Text Field
//=============================================

export function getAppCodeDataDisplay(options) {
    let textDisplayMode = ((options)&&(options.textDisplayMode)) ? options.textDisplayMode : "ace/mode/javascript"
    let editorOptions = ((options)&&(options.editorOptions)) ? options.editorOptions : AceTextEditor.OPTION_SET_DISPLAY_MAX
    return new AceTextEditor(textDisplayMode,editorOptions);
}

/** GEts the data source for a component field that represents code. An optional input is componentCompiledFieldName which 
 * should be the compiled version of the code and an error object if the code does not compile. If it is included as an error, error
 * info will be displayed for the code. */
export function getAppCodeViewModeEntry(componentFieldName,componentCompiledFieldName,viewName,viewLabel,options) {

    return {
        name: viewName,
        label: viewLabel,
        sourceLayer: "app",
        sourceType: ((options)&&(options.sourceType)) ? options.sourceType : "function",
        argList: ((options)&&(options.argList !== undefined)) ? options.argList : "",
        isActive: ((options)&&(options.isActive)) ? options.isActive : false,
        getSourceState: (component,oldSourceState) => {
            let dataSource = getComponentFieldDisplaySource(componentFieldName,componentCompiledFieldName)
            return dataDisplayHelper.dataSourceToSourceState(component,dataSource,oldSourceState)
        },
        getViewModeElement: (sourceState,cellShowing,setEditModeData,size) => <VanillaViewModeElement
				sourceState={sourceState}
				getDataDisplay={sourceState => getAppCodeDataDisplay(options)}
                setEditModeData={setEditModeData}
				cellShowing={cellShowing} 
                size={size} />,
        sizeCommandInfo: AceTextEditor.SIZE_COMMAND_INFO
    }
}

/** This method returns the data dispklay data source for the code field data displays. */
function getComponentFieldDisplaySource(componentCodeFieldName,componentCompiledFieldName) {

    return {
        doUpdate: (component) => {
            //return value is whether or not the data display needs to be udpated
            let reloadData = component.isFieldUpdated(componentCodeFieldName);
            let reloadDataDisplay = false;
            return {reloadData,reloadDataDisplay};
        },

        getData: (component) => {
            let componentCodeField = component.getField(componentCodeFieldName);
            if((componentCodeField === undefined)||(componentCodeField === null)) componentCodeField = "";

            let wrappedData = {};
            wrappedData.data = componentCodeField;

            //append compiled error info if applicable
            if(componentCompiledFieldName) {
                let componentCompiledField = component.getField(componentCompiledFieldName);
                if(componentCompiledField instanceof Error) {
                    wrappedData.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_ERROR;
                    wrappedData.message = "Error compiling code: " + componentCompiledField.toString();
                }
            }

            return wrappedData;
        },

        getEditOk: (component) => {
            return true;
        },
        
        saveData: (text,component) => {
            let app = component.getApp();

            var initialValue = component.getField(componentCodeFieldName);
            var command = {};
            command.type = "updateComponentField";
            command.memberId = component.getMemberId();
            command.fieldName = componentCodeFieldName;
            command.initialValue = initialValue;
            command.targetValue = text;

            app.executeCommand(command);
            return true; 
        }
    }
}