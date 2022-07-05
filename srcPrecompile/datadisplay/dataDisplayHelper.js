import DATA_DISPLAY_CONSTANTS from "/apogeejs-app-lib/src/datadisplay/dataDisplayConstants.js";
import apogeeutil from "/apogeejs-util-lib/src/apogeeUtilLib.js"

let dataDisplayHelper = {};
export {dataDisplayHelper as default}

// const SPACING_FORMAT_STRING = "\t";

// /** This generates a standard source state from a standard data source. */
// dataDisplayHelper.dataSourceToSourceState = function(component,dataSource,oldSourceState) {
//     let sourceState = {}
//     let {reloadData,reloadDataDisplay} = dataSource.doUpdate(component)

//     //update data display
//     sourceState.displayDataVersion = (reloadDataDisplay)||(!oldSourceState) ? component.getInstanceNumber() : oldSourceState.dataDisplayVersion
    
//     //update data
//     sourceState.dataVersion = (reloadData)||(!oldSourceState) ? component.getInstanceNumber() : oldSourceState.dataVersion
//     if((reloadData)||(!oldSourceState)) {
//         sourceState.dataVersion = component.getInstanceNumber()

//         let dataResult = dataSource.getData(component)
//         sourceState.data = dataResult.data
//         sourceState.hideDisplay = (dataResult.hideDisplay === true)
//         if(dataResult.messageType) {
//             sourceState.messageType = dataResult.messageType 
//             sourceState.message = dataResult.message
//         }
//         else {
//             sourceState.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_NONE
//             sourceState.message = ""
//         }
//     }
//     else {
//         sourceState.dataVersion = oldSourceState.dataVersion
//         sourceState.data = oldSourceState.data
//         sourceState.hideDisplay = oldSourceState.hideDisplay
//         sourceState.message = oldSourceState.message
//         sourceState.messageType = oldSourceState.messageType
//     }
    
//     let editOk = dataSource.getEditOk ? dataSource.getEditOk(component) : false
//     if(editOk) {
//         sourceState.editOk = editOk
//         sourceState.save = data => dataSource.saveData(data,component)
//     }

//     return sourceState
// }



// /** This function creates the data display data source  for the data of the given member. The
//  * member field should be the field name used to access the data source from the associated component. */
// dataDisplayHelper.getMemberDataJsonDataSource = function(memberFieldName,doReadOnly) {
//     return _getMemberDataDataSource(memberFieldName,doReadOnly);
// }

// /** This function creates editor callbacks or member data where the editor takes text format. 
//  * This data source sets error valueData (a substitue value) when the user tries to save an improperly 
//  * formatted JSON. */
//  dataDisplayHelper.getMemberDataTextDataSource = function(memberFieldName,doReadOnly) {
//     return _getMemberDataDataSource(memberFieldName,doReadOnly,{stringify: true});
//  }

//  /** This gets a data source for JSON or stringified JSON data from a member. */
// function _getMemberDataDataSource(memberFieldName,doReadOnly,options) {
//     if(!options) options = {};
    
//     return {

//         doUpdate: function(component) {
//             //return value is whether or not the data display needs to be udpated
//             let reloadData = component.isMemberDataUpdated(memberFieldName);
//             let reloadDataDisplay = false;
//             return {reloadData,reloadDataDisplay};
//         },

//         getData: function(component) {
//             return dataDisplayHelper.getWrappedMemberData(component,memberFieldName,options);
//         },

//         getEditOk: doReadOnly ? 
//             function (component) { return false }  :
//             function (component) {
//                 let member = component.getField(memberFieldName)
//                 return !member.hasCode() //data is editable if code is not set
//             },

//         saveData: doReadOnly ? undefined :
//             function(data,component) {
//                 let app = component.getApp()

//                 //is the display data is stringified, parse it into a json
//                 if(options.stringify) {
//                     let text = data;
//                     if(text === "undefined") {
//                         data = undefined;
//                     }
//                     else if(text == "NaN") {
//                         data = NaN;
//                     }
//                     else {
//                         //here we add apogee specific error information if the parse fails
//                         try {
//                             data = JSON.parse(text);
//                         }
//                         catch(error) {
//                             //if we had an error parsing append the string data to the error so we can display it.
//                             if(apogeeutil._.isString(data)) {
//                                 error.valueData = {
//                                     value: text,
//                                     nominalType: apogeeutil.MIME_TYPE_JSON,
//                                     stringified: true
//                                 };
//                             }
//                             data = error;
                            
//                         }
//                     }
//                 }

//                 let member = component.getField(memberFieldName);
//                 var commandData = {};
//                 commandData.type = "saveMemberData";
//                 commandData.memberId = member.getId();
//                 commandData.data = data;
                
//                 app.executeCommand(commandData);
//                 return true;
//             }
//     }
// }

// /** This function creates editor callbacks or the member function body. 
//  * The argument optionalClearCodeValue can optionally be set. If so, the member data will be 
//  * set with this value if the function body and supplemental code are empty. 
//  * The optionalDefaultDataValue will be used to clear the function and save the data value if the formula and
//  * private code are empty strings. */
// dataDisplayHelper.getMemberFunctionBodyDataSource = function(memberFieldName) {

//     return {

//         doUpdate: function(component) {
//             //return value is whether or not the data display needs to be udpated
//             let reloadData = component.isMemberFieldUpdated(memberFieldName,"functionBody");
//             let reloadDataDisplay = false;
//             return {reloadData,reloadDataDisplay};
//         },

//         getData: function(component) {
//             let functionMember = component.getField(memberFieldName);
//             return { 
//                 data: functionMember.getFunctionBody()
//             }
//         },

//         getEditOk: function(component) {
//             return true;
//         },

//         saveData: function(text,component) {
//             let app = component.getApp()
//             let functionMember = component.getField(memberFieldName);

//             var commandData = {};
//             commandData.type = "saveMemberCode";
//             commandData.memberId = functionMember.getId();
//             commandData.argList = functionMember.getArgList();
//             commandData.functionBody = text;
//             commandData.supplementalCode = functionMember.getSupplementalCode();
            
//             app.executeCommand(commandData);
//             return true;
//         }
//     }
// }

// /** This function creates editor callbacks or the member supplemental code. */
// dataDisplayHelper.getMemberSupplementalDataSource = function(memberFieldName) {

//     return {

//         doUpdate: function(component) {
//             //return value is whether or not the data display needs to be udpated
//             let reloadData = component.isMemberFieldUpdated(memberFieldName,"supplementalCode");
//             let reloadDataDisplay = false;
//             return {reloadData,reloadDataDisplay};
//         },

//         getData: function(component) {
//             let functionMember = component.getField(memberFieldName);
//             return {
//                 data: functionMember.getSupplementalCode()
//             }
//         },

//         getEditOk: function() {
//             return true;
//         },

//         saveData: function(text,component) {
//             let app = component.getApp()

//             let functionMember = component.getField(memberFieldName);

//             var commandData = {};
//             commandData.type = "saveMemberCode";
//             commandData.memberId = functionMember.getId();
//             commandData.argList = functionMember.getArgList();
//             commandData.functionBody = functionMember.getFunctionBody();
//             commandData.supplementalCode = text;
            
//             app.executeCommand(commandData);
//             return true;
//         }
//     }
// }


// /** This function creates the data display data source  for the data of the given member. The
//  * member field should be the field name used to access the data source from the associated component. */
// dataDisplayHelper.getStandardErrorDataSource = function() {
    
//     return {
//         doUpdate: function(component) {
//             //remove the view if here is an error and error info
//             let removeView;
//             ////////////////////////////////
//             // NEED TO MOVE THESE FUNCTIONS TO COMPONENT FROM COMPONENT VIEW!
//             ////////////////////////////////
//             if(component.getState() == apogeeutil.STATE_ERROR) {
//                 let errorInfoList = component.getErrorInfoList();
//                 removeView = !((errorInfoList)&&(errorInfoList.length > 0));
//             }
//             else {
//                 removeView = true;
//             }

//             let reloadData = component.isMemberDataUpdated("member");
//             let reloadDataDisplay = false;
//             return {reloadData,reloadDataDisplay,removeView};
//         },

//         getData: function(component) {
//             ////////////////////////////////
//             // NEED TO MOVE THESE FUNCTIONS TO COMPONENT FROM COMPONENT VIEW!
//             ////////////////////////////////
//             if(component.getState() == apogeeutil.STATE_ERROR) {
//                 let errorInfoList = component.getErrorInfoList()
//                 if((errorInfoList)&&(errorInfoList.length > 0)) {
//                     //show data view, this is our data
//                     return {
//                         data: errorInfoList
//                     }
//                 }
//             }

//             //no error info; we shouldn't get here
//             return {
//                 data: apogeeutil.INVALID_VALUE
//             }
            
//         }
//     }
// }

// /** This method returns data source wrapped data, for getData and getDisplayData 
//  * options:
//  * - stringify - Stringifies the data. Otherwise it is returned as is (JSON data assumed).
// */
// dataDisplayHelper.getWrappedMemberData = function(component,memberFieldName,options) {
//     if(!options) options = {};
//     let member = component.getField(memberFieldName);
//     let wrappedData = {};
//     if(member.getState() != apogeeutil.STATE_NORMAL) {

//         wrappedData.data = apogeeutil.INVALID_VALUE;
//         wrappedData.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_INFO;
//         wrappedData.message = "Data Unavailable";
        
//         // switch(member.getState()) {
//         //     case apogeeutil.STATE_ERROR: 
//         //         //check if there is valueData on the error object, in which case we may be able to include it.
//         //         let error = member.getError();
//         //         if((error)&&(error.valueData)) {
//         //             //there is a substitute value
//         //             //only process json, which is what we expect this to hold
//         //             if(error.valueData.nominalType == MIME_TYPE_JSON) {
//         //                 if(options.stringify) {
//         //                     if(error.valueData.stringified) {
//         //                         wrappedData.data = error.valueData.value;
//         //                     }
//         //                     else {
//         //                         wrappedData.data = _stringifyJsonData(error.valueData.value);
//         //                     }
//         //                 }
//         //                 else {
//         //                     wrappedData.data = error.valueData.value;
//         //                 }
//         //             }
//         //         }
//         //         else {
//         //             wrappedData.data = apogeeutil.INVALID_VALUE;
//         //         }
//         //         wrappedData.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_ERROR;
//         //         wrappedData.message = "Error: " + member.getErrorMsg();
//         //         break;

//         //     case apogeeutil.STATE_PENDING:
//         //         wrappedData.data = apogeeutil.INVALID_VALUE;
//         //         wrappedData.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_INFO;
//         //         wrappedData.message = "Value pending!";
//         //         break;

//         //     case apogeeutil.STATE_INVALID:
//         //         wrappedData.data = apogeeutil.INVALID_VALUE;
//         //         wrappedData.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_INFO;
//         //         wrappedData.message = "Value invalid!";
//         //         break;

//         //     default:
//         //         throw new Error("Unknown display data value state!")
//         // }

//         wrappedData.hideDisplay = (wrappedData.data === apogeeutil.INVALID_VALUE);
//     }
//     else {
//         let data = member.getData();
//         if(options.stringify) {
//             wrappedData.data = _stringifyJsonData(data);
//         }
//         else {
//             wrappedData.data = data;
//         }
//     }

//     return wrappedData;
// }

// function _stringifyJsonData(data) {
//     if(data == apogeeutil.INVALID_VALUE) return apogeeutil.INVALID_VALUE;
//     else if(data === undefined) return "undefined";
//     else if(Number.isNaN(data)) return "NaN";
//     else return JSON.stringify(data,null,SPACING_FORMAT_STRING);
// }


//////////////////////////////////////////////////////////////////

/** This function handles the typical error case for a component. If the component
 * is not in the "normal" state (meaning it is: error, pending or invalid value), the
 * display is hidden and a simple "Data Unavailable" message is shown. 
 * If there is no non-normal condition, null is returned. */
dataDisplayHelper.typicalErrorSourceStateCheck = function(component) {
    if(component.getState() != apogeeutil.STATE_NORMAL) {
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
        return null
    }
}

/** This is a source state check for an error condition intened for use with a data display that
 * shows stringified parsed data. It allows data with a parsing error to show the original unparsable data.
 * In the case of a parsing error, the unparsed data is returned in the data field. If "editOk" is true, the 
 * save function must be appended. If the case of a different non-normal case, a complete sourceState object is returned
 * hideing the display and showing a simple message. In the case of no non-normal state, null is returned. */
dataDisplayHelper.parsedErrorSourceStateCheck = function(component,memberFieldName,editOk) {
    let member = component.getField(memberFieldName);

    if(member.getState() != apogeeutil.STATE_NORMAL) {

        //in the error case, check for an unparsed subsititue value
        if(member.getState() == apogeeutil.STATE_ERROR) {
            let error = member.getError()
            if((error)&&(error.unparsedData !== undefined)) {
                return {
                    dataState: {
                        data: error.unparsedData,
                        editOk: editOk
                    }
                }
            }
        }
        
        //standard error handling
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
        return null
    }
    
}

dataDisplayHelper.getJsonDataState = function(component,memberFieldName,editOk) {
    let member = component.getField(memberFieldName)
    return {
        data: member.getData(),
        editOk: editOk
    }
}

dataDisplayHelper.getStringifiedJsonSourceState = function(component,memberFieldName,editOk) {
    let member = component.getField(memberFieldName)
    let data = member.getData()
    try {
        let sourceState = {}
        sourceState.dataState = {
            data: apogeeutil.stringifyJsonData(data),
            editOk: editOk
        }
        return sourceState
    }
    catch(error) {
        let sourceState = {}
        sourceState.dataState = {data: apogeeutil.INVALID_VALUE}
        sourceState.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_ERROR
        sourceState.message = "Error converting data to text: " + error.toString()
        return sourceState
    }

}



dataDisplayHelper.getFormattedJsonSourceState = function(component,memberFieldName,editOk,
    formatIsValidFunction,formatErrorMsg = "Data value can not be displayed") {

    let dataState = dataDisplayHelper.getJsonDataState(component,memberFieldName,editOk)
    if(!formatIsValidFunction(dataState.data)) {
        let sourceState = {
            dataState: dataState
        }
        return sourceState
    }
    else {
        let sourceState = {}
        sourceState.dataState = {
            data: apogeeutil.INVALID_VALUE,
            editOK: false
        }
        sourceState.hideDisplay = true
        sourceState.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_ERROR
        sourceState.message = formatErrorMsg
        sourceState
    }      
}

////////////////////////////////////////////////


// dataDisplayHelper.getJsonSourceState = function(component,memberFieldName,oldSourceState,editOk) {

//     let member = component.getField(memberFieldName)
//     if(member.getState() != apogeeutil.STATE_NORMAL) {
//         let sourceState = {}
//         sourceState.dataState = {data: apogeeutil.INVALID_VALUE}
//         sourceState.hideDisplay = true
//         sourceState.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_INFO
//         sourceState.message = "Data Unavailable"
//         return sourceState
//     }
//     else {
//         let dataState, saveFunction
//         let dataStateUpdated, saveFunctionUpdated

//         //data state
//         if( !oldSourceState || member.isFieldUpdated("data") ) {
//             dataStateUpdated = true
//             dataState = {
//                 data: member.getData(),
//                 editOk: editOk
//             }
//         }
        
//         //save function
//         if(editOk) {
//             if( !oldSourceState) {
//                 saveFunctionUpdated = true

//                 let app = component.getApp()
//                 let memberId = member.getId()

//                 saveFunction = json => { 
//                     var commandData = {}
//                     commandData.type = "saveMemberData"
//                     commandData.memberId = memberId
//                     commandData.data = json
                    
//                     app.executeCommand(commandData)
//                     return true
//                 }
//             }
//         }

//         //source state
//         if(dataStateUpdated || saveFunctionUpdated) {
//             return {
//                 dataState: dataStateUpdated ? dataState : oldSourceState.dataState,
//                 save: editOk ? (saveFunctionUpdated ? saveFunction : oldSourceState.save) : undefined
//             }
//         }
//         else {
//             return oldSourceState
//         }
//     }
// }



// dataDisplayHelper.loadStringifiedJsonSourceState = function(component,memberFieldName,sourceState,editOk) {

//     let member = component.getField(memberFieldName)
    
//     //special consideration for unparsed data (when we have a parsing error on input)
//     let memberError = (member.getState == apogeeutil.STATE_ERROR) ? member.getError() : null
//     let unparsedData = memberError ? memberError.unparsedData : null

//     if( (member.getState() != apogeeutil.STATE_NORMAL) && !(unparsedData === null) ) {
//         let sourceState = {}
//         sourceState.dataState = {data: apogeeutil.INVALID_VALUE}
//         sourceState.hideDisplay = true
//         sourceState.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_INFO
//         sourceState.message = "Data Unavailable"
//         return sourceState
//     }
//     else {
//         let dataState, saveFunction
//         let dataStateUpdated, saveFunctionUpdated

//         //data state
//         if( !oldSourceState || ((unparsedData !== null)&&(member.isFieldUpdated("state"))) ) {
//             //data for parse error
//             dataStateUpdated = true
//             dataState = {
//                 data: unparsedData,
//                 editOk: editOk
//             }
//         }
//         if( !oldSourceState || member.isFieldUpdated("data") ) {
//             //normal data
//             dataStateUpdated = true
//             let data = member.getData()
//             try {
//                 dataState = {
//                     data: apogeeutil.stringifyJsonData(data),
//                     editOk: editOk
//                 }
//             }
//             catch(error) {
//                 let sourceState = {}
//                 sourceState.dataState = {data: apogeeutil.INVALID_VALUE}
//                 sourceState.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_ERROR
//                 sourceState.message = "Error converting data to text: " + error.toString()
//                 return sourceState
//             }
//         }
        
//         //save function
//         if(editOk) {
//             if( !oldSourceState) {
//                 saveFunctionUpdated = true

//                 let app = component.getApp()
//                 let memberId = member.getId()

//                 saveFunction = text => {
//                     let returnErrorAsData = true //this means an Error is returned rather than thrown
//                     let data = apogeeutil.parseJsonData(text,returnErrorAsData) //this will handle recording a parse error properly
                    
//                     var commandData = {}
//                     commandData.type = "saveMemberData"
//                     commandData.memberId = memberId
//                     commandData.data = data
                    
//                     app.executeCommand(commandData)
//                     return true
//                 }
//             }
//         }

//         //source state
//         if(dataStateUpdated || saveFunctionUpdated) {
//             return {
//                 dataState: dataStateUpdated ? dataState : oldSourceState.dataState,
//                 save: editOk ? (saveFunctionUpdated ? saveFunction : oldSourceState.save) : undefined
//             }
//         }
//         else {
//             return oldSourceState
//         }
// //     }
// // }

// dataDisplayHelper.loadFormattedJsonSourceState = function(component,memberFieldName,sourceState,editOk,
//         formatIsValidFunction,formatErrorMsg = "Data value can not be displayed") {

//     dataDisplayHelper.loadJsonSourceState(component,memberFieldName,sourceState,editOk)
//     if(!sourceState.hideDisplay) {
//         if(!formatIsValidFunction(sourceState.dataState.data)) {
//             sourceState.dataState = {
//                 data: apogeeutil.INVALID_VALUE,
//                 editOK: false
//             }
//             sourceState.hideDisplay = true
//             sourceState.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_ERROR
//             sourceState.message = formatErrorMsg
//         }
//     }
// }

// dataDisplayHelper.loadFunctionBodySourceState = function(component,memberFieldName,sourceState) {
//     let member = component.getField(memberFieldName)
//     sourceState.dataState = {
//         data: member.getFunctionBody(),
//         editOk: true
//     }
//     sourceState.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_NONE
// }

// dataDisplayHelper.loadPrivateCodeDataState = function(component,memberFieldName,sourceState) {
//     let member = component.getField(memberFieldName)
//     sourceState.dataState = {
//         data: member.getSupplementalCode(),
//         editOk: true
//     }
//     sourceState.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_NONE
// }

// dataDisplayHelper.getMemberTextToJsonSaveFunction = function(component,memberFieldName) {

//     let app = component.getApp()
//     let member = component.getField(memberFieldName);
//     let memberId = member.getId()

//     return text => {
//         let returnErrorAsData = true //this means an Error is returned rather than thrown
//         let data = apogeeutil.parseJsonData(text,returnErrorAsData)
        
//         var commandData = {}
//         commandData.type = "saveMemberData"
//         commandData.memberId = memberId
//         commandData.data = data
        
//         app.executeCommand(commandData)
//         return true
//     }
// }

// dataDisplayHelper.getMemberJsonToJsonSaveFunction = function(component,memberFieldName) {

//     let app = component.getApp()
//     let member = component.getField(memberFieldName)
//     let memberId = member.getId()

//     return json => { 
//         var commandData = {}
//         commandData.type = "saveMemberData"
//         commandData.memberId = memberId
//         commandData.data = json
        
//         app.executeCommand(commandData)
//         return true
//     }
// }

// dataDisplayHelper.getFunctionBodySaveFunction = function(component,memberFieldName) {
//     let app = component.getApp()
//     let member = component.getField(memberFieldName)
//     let memberId = member.getId()
//     let argList = member.getArgList()
//     let privateCode = member.getSupplementalCode()

//     return functionBody => { 
//         var commandData = {}
//         commandData.type = "saveMemberCode"
//         commandData.memberId = memberId
//         commandData.argList = argList
//         commandData.functionBody = functionBody
//         commandData.supplementalCode = privateCode;
        
//         app.executeCommand(commandData)
//         return true
//     }
// }

// dataDisplayHelper.getPrivateCodeSaveFunction = function(component,memberFieldName) {
//     let app = component.getApp()
//     let member = component.getField(memberFieldName)
//     let memberId = member.getId()
//     let argList = member.getArgList()
//     let functionBody = member.getFunctionBody()

//     return privateCode => { 
//         var commandData = {}
//         commandData.type = "saveMemberCode"
//         commandData.memberId = memberId
//         commandData.argList = argList
//         commandData.functionBody = functionBody
//         commandData.supplementalCode = privateCode;
        
//         app.executeCommand(commandData)
//         return true
//     }
// }
