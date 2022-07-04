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

export function getMemberDataTextSourceState(component,memberFieldName,oldSourceState,options) {
    if( !oldSourceState || component.isMemberFieldUpdated(memberFieldName,"data") ) {
        let sourceState = {}
        let doReadOnly = ((options)&&(options.editorOptions)) ? options.editorOptions.doReadOnly : false;
        let member = component.getField(memberFieldName)
        let editOk = !doReadOnly && !member.hasCode() 
        dataDisplayHelper.loadStringifiedJsonSourceState(component,memberFieldName,sourceState,editOk)

        if(editOk) {
            sourceState.save =  dataDisplayHelper.getMemberTextToJsonSaveFunction(component,memberFieldName)
        }

        return sourceState
    }
    else {
        return oldSourceState
    }
}

export function getMemberDataTextDisplay(options) {
    let textDisplayMode = ((options)&&(options.textDisplayMode)) ? options.textDisplayMode : "ace/mode/json";
    let editorOptions = ((options)&&(options.editorOptions)) ? options.editorOptions : AceTextEditor.OPTION_SET_DISPLAY_SOME;
    return new AceTextEditor(textDisplayMode,editorOptions);        
}

export function getMemberDataTextViewModeEntry(memberFieldName,options) {
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

    return {
        name: ((options)&&(options.name)) ? options.name : "Value",
        label: ((options)&&(options.label)) ? options.label : "Value",
        sourceLayer: "model",
        sourceType: "data",
        suffix: suffix, //default value comes from member field name 
        isActive: ((options)&&(options.suffix)) ? options.suffix : false,
        getSourceState: (component,oldSourceState) => getMemberDataTextSourceState(component,memberFieldName,options),
        getViewModeElement: (sourceState,inEditMode,setEditModeData,verticalSize,cellShowing) => <VanillaViewModeElement
                displayState={sourceState.displayState}
                dataState={sourceState.dataState}
                hideDisplay={sourceState.hideDisplay}
                save={sourceState.save}
                inEditMode={inEditMode}
                setEditModeData={setEditModeData}
                verticalSize={verticalSize}
                cellShowing={cellShowing}
                getDataDisplay={displayState => getMemberDataTextDisplay(options)} />,
        sizeCommandInfo: AceTextEditor.SIZE_COMMAND_INFO
    }
}

//==============================
// Member Code View Modes
//==============================
export function getFormulaSourceState(component,memberFieldName,oldSourceState) {
    if( (!oldSourceState) || 
        (component.isMemberFieldUpdated(memberFieldName,"functionBody")) ||
        (component.areAnyMemberFieldsUpdated(memberFieldName,["argList","functionBody","supplementalCode"])) ) {
        //note - the save function depends on all the fields listed above
        //we do a little of extra state rewriting here, but that is ok
        let sourceState = {}
        dataDisplayHelper.loadFunctionBodySourceState(component,memberFieldName,sourceState)
        sourceState.save =  dataDisplayHelper.getFunctionBodySaveFunction(component,memberFieldName)
        return sourceState
    }
    else {
        return oldSourceState
    }
}

export function getFormulaDataDisplay(options) {
    let editorOptions = ((options)&&(options.editorOptions)) ? options.editorOptions : AceTextEditor.OPTION_SET_DISPLAY_MAX
    return new AceTextEditor("ace/mode/javascript",editorOptions)
}

export function getFormulaViewModeEntry(memberFieldName,options) {
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
                getDataDisplay={displayState => getFormulaDataDisplay(options)} />,
        sizeCommandInfo: AceTextEditor.SIZE_COMMAND_INFO
    }
}

export function getPrivateCodeSourceState(component,memberFieldName,oldSourceState) {
    if( (!oldSourceState) || 
        (component.isMemberFieldUpdated(memberFieldName,"supplementalCode")) ||
        (component.areAnyMemberFieldsUpdated(memberFieldName,["argList","functionBody","supplementalCode"])) ) {
        //note - the save function depends on all the fields listed above    
        //we do a little of extra state rewriting here, but that is ok
        let sourceState = {}
        dataDisplayHelper.loadPrivateCodeDataState(component,memberFieldName,sourceState)
        sourceState.save =  dataDisplayHelper.getPrivateCodeSaveFunction(component,memberFieldName)
        return sourceState
    }
    else {
        return oldSourceState
    }
}

export function getPrivateCodeDataDisplay(options) {
    let editorOptions = ((options)&&(options.editorOptions)) ? options.editorOptions : AceTextEditor.OPTION_SET_DISPLAY_MAX
    return new AceTextEditor("ace/mode/javascript",editorOptions)
}

export function getPrivateViewModeEntry(memberFieldName,options) {
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
                getDataDisplay={displayState => getPrivateCodeDataDisplay(options)} />,
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