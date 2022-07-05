import {getFormComponentDefaultMemberJson} from "/apogeejs-app-lib/src/components/formInputComponentUtils.js";
import {defineHardcodedDataMember} from "/apogeejs-model-lib/src/apogeeModelLib.js";

import {getConfigViewModeEntry}  from "/apogeejs-app-lib/src/components/FormInputBaseComponentView.js";
import AceTextEditor from "/apogeejs-app-lib/src/datadisplay/AceTextEditor.js";
import dataDisplayHelper from "/apogeejs-app-lib/src/datadisplay/dataDisplayHelper.js";
import {getErrorViewModeEntry} from "/apogeejs-app-lib/src/datasource/standardDataDisplay.js";
import VanillaViewModeElement from "/apogeejs-app-lib/src/datadisplay/VanillaViewModeElement.js";
import DATA_DISPLAY_CONSTANTS from "/apogeejs-app-lib/src/datadisplay/dataDisplayConstants.js";


const DATA_MEMBER_FUNCTION_BODY = `
return WebRequestCell.formResultToRequest(formResult);
`

//this defines the hardcoded type we will use
let dataMemberTypeName = "apogee.WebRequestMember";
defineHardcodedDataMember(dataMemberTypeName,DATA_MEMBER_FUNCTION_BODY);

///////////////////////////////////////////////////////
// view code
////////////////////////////////////////////////////////


function getMetaViewDisplay(component) {
    let dataDisplaySource = _getMetaDataSource();
    return new AceTextEditor(component,dataDisplaySource,"ace/mode/json",AceTextEditor.OPTION_SET_DISPLAY_SOME);
}

function getBodyViewDisplay(component) {
    let dataDisplaySource = _getBodyDataSource();
    return new AceTextEditor(component,dataDisplaySource,"ace/mode/text",AceTextEditor.OPTION_SET_DISPLAY_SOME);
}

/** This method returns the form layout.
 * @protected. */
function getFormLayout() {
    return [
        {
            type: "horizontalLayout",
            formData: [
                {
                    type: "textField",
                    label: "URL: ",
                    size: 75,
                    key: "url",
                    meta: {
                        expression: "choice",
                        expressionChoiceKey: "urlType"
                    }
                },
                {
                    type: "radioButtonGroup",
                    entries: [["Value","value"],["Reference","simple"]],
                    value: "value",
                    key: "urlType"
                }
            ]
        },
        {
            type: "showHideLayout",
            heading: "Options",
            closed: true,
            formData: [
                {
                    type: "dropdown",
                    label: "Method: ",
                    entries: ["GET","POST","PUT","DELETE"],
                    key: "method"
                },
                {
                    type: "horizontalLayout",
                    formData: [
                        {
                            type: "textarea",
                            label: "Body: ",
                            rows: 4,
                            cols: 75,
                            key: "body",
                            meta: {
                                expression: "choice",
                                expressionChoiceKey: "bodyType",
                            }
                        },
                        {
                            type: "radioButtonGroup",
                            entries: [["Value","value"],["Reference","simple"]],
                            value: "value",
                            key: "bodyType"
                        }
                    ]
                },
                {
                    type: "horizontalLayout",
                    formData: [
                        {
                            type: "dropdown",
                            label: "Content Type: ",
                            entries: [
                                ["<none>","none"],
                                ["JSON (application/json)","application/json"],
                                ["Plain Text (text/plain)","text/plain"],
                                ["CSV (text/csv)","text/csv"],
                                ["XML (application/xml)","application/xml"],
                                ["Form Encoded (multipart/form-data)", "multipart/form-data"],
                                ["Form Encoded (application/x-www-form-urlencoded)","application/x-www-form-urlencoded"],
                                ["<other>","other"]
                            ],
                            value: "none",
                            key: "contentType",
                            hint: "For a content type not listed here, choose 'other' and enter the content type manually under headers"
                        }
                    ]
                },
                {
                    type: "list",
                    label: "Headers: ",
                    entryType: {
                        layout: {
                            type: "panel",
                            formData: [
                                {
                                    "type": "horizontalLayout",
                                    "formData": [
                                        {
                                            type: "textField",
                                            size: 30,
                                            key: "headerKey"
                                        },
                                        {
                                            type: "textField",
                                            size: 30,
                                            key: "headerValue",
                                            meta: {
                                                expression: "choice",
                                                expressionChoiceKey: "headerValueType",
                                            }
                                        },
                                        {
                                            type: "radioButtonGroup",
                                            entries: [["Value","value"],["Reference","simple"]],
                                            value: "value",
                                            key: "headerValueType"
                                        }
                                    ]
                                }
                            ],
                            key: "key",
                            meta: {
                                expression: "object"
                            }
                        }
                    },
                    key: "headers",
                    meta: {
                        expression: "array"
                    }
                },
                {
                    type: "radioButtonGroup",
                    label: "Output Format: ",
                    entries: [["Match Response Mime Type","mime"],["Text (Override Mime Type)","text"],["JSON (Override Mime Type)","json"]],
                    value: "mime",
                    key: "outputFormat"
                },
                {
                    type: "radioButtonGroup",
                    label: "On Error Response: ",
                    entries: [["Cell Error","error"],["No Cell Error","noError"]],
                    value: "error",
                    key: "onError"
                }
            ]
        }
    ]
}

//==========================
// Private Methods
//==========================


function getSourceState(component,oldSourceState) {

    let memberFieldName = "data.member"
    let dataMember = component.getField(memberFieldName)

    if(dataMember.getState() != apogeeutil.STATE_NORMAL) {
        //handle non-normal state - error, pending, invalid value
        if ( !oldSourceState || dataMember.isFieldUpdated("state") ) {
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
        if( !oldSourceState || (dataMember.isFieldUpdated("data")) ) {
            let editOk = false
            return dataDisplayHelper.getStringifiedJsonSourceState(component,"data.member",editOk)
        }
        else {
            return oldSourceState
        }
    }
}

// function _getBodyDataSource() {
//     return {
//         doUpdate: (component) => {
//             //return value is whether or not the data display needs to be udpated
//             let reloadData = component.isMemberDataUpdated("data.member");
//             let reloadDataDisplay = false;
//             return {reloadData,reloadDataDisplay};
//         },

//         getData: (component) => {
//             //Here we return just the body (not header), converted to text if needed
//             let wrappedData = dataDisplayHelper.getWrappedMemberData(component,"data.member");
//             if(wrappedData.data !== apogeeutil.INVALID_VALUE) {
//                 let bodyAndMeta = wrappedData.data;
//                 if(!bodyAndMeta) {
//                     wrappedData.data = "";
//                 }
//                 else if(bodyAndMeta.body === undefined) {
//                     //just display an empty body
//                     wrappedData.data = "";
//                 }
//                 else {
//                     if(typeof bodyAndMeta.body == "string") {
//                         wrappedData.data = bodyAndMeta.body;      
//                     }
//                     else {
//                         wrappedData.data = JSON.stringify(bodyAndMeta.body);
//                     }
//                 }
//             }
//             return wrappedData;
//         }
//     }
// }

// function _getMetaDataSource() {
//     return {
//         doUpdate: (component) => {
//             //return value is whether or not the data display needs to be udpated
//             let reloadData = component.isMemberDataUpdated("data.member");
//             let reloadDataDisplay = false;
//             return {reloadData,reloadDataDisplay};
//         },

//         getData: (component) => {
//             //Here we return just the meta data, as text
//             let wrappedData = dataDisplayHelper.getWrappedMemberData(component,"data.member");
//             if(wrappedData.data !== apogeeutil.INVALID_VALUE) {
//                 let bodyAndMeta = wrappedData.data;
//                 if((!bodyAndMeta)||(!bodyAndMeta.meta)) {
//                     wrappedData.data = "";
//                 }
//                 else {
//                     wrappedData.data = JSON.stringify(bodyAndMeta.meta);
//                 }
//             }
//             return wrappedData;
//         }
//     }
// }


//===============================
// config
//===============================

const ADDITIONAL_CHILD_MEMBERS = [
    {
        "name": "headers",
        "type": "apogee.DataMember"
    },
    {
        "name": "body",
        "type": "apogee.DataMember"
    },
]

const WebRequestComponentConfig = {
    displayName: "Web Request Cell",
    defaultMemberJson: getFormComponentDefaultMemberJson(dataMemberTypeName/*,ADDITIONAL_CHILD_MEMBERS*/),
    defaultComponentJson: {
        type: "apogeeapp.WebRequestCell"
    },

    viewModes: [
        getErrorViewModeEntry(),
        {
            name: "Complete Response",
            label: "Complete Response",
            sourceLayer: "model", 
            sourceType: "data",
            suffix: ".data",
            isActive: true,
            getSourceState: getSourceState,
            getViewModeElement: (sourceState,inEditMode,setEditModeData,verticalSize,cellShowing) => <VanillaViewModeElement
                displayState={sourceState.displayState}
                dataState={sourceState.dataState}
                hideDisplay={sourceState.hideDisplay}
                save={sourceState.save}
                inEditMode={inEditMode}
                setEditModeData={setEditModeData}
                verticalSize={verticalSize}
				cellShowing={cellShowing}
                getDataDisplay={displayState => new AceTextEditor("ace/mode/json",AceTextEditor.OPTION_SET_DISPLAY_SOME)} />
        },
        // {
        //     name: "Meta",
        //     label: "Response Info",
        //     sourceLayer: "model", 
        //     sourceType: "data",
        //     suffix: ".data.meta",
        //     isActive: false,
        //     getViewModeElement: (component,showing,setEditModeData,setMsgData,size,setSizeCommandData) => <VanillaViewModeElement
		// 		component={component}
		// 		getDataDisplay={getMetaViewDisplay}
        //         setEditModeData={setEditModeData}
        //         setMsgData={setMsgData}
		// 		showing={showing} 
        //         size={size}
        //         setSizeCommandData={setSizeCommandData} />
    
        // },
        // {
        //     name: "Body",
        //     label: "Response Body",
        //     sourceLayer: "model", 
        //     sourceType: "data",
        //     suffix: ".data.body",
        //     isActive: true,
        //     getViewModeElement: (component,showing,setEditModeData,setMsgData,size,setSizeCommandData) => <VanillaViewModeElement
		// 		component={component}
		// 		getDataDisplay={getMetaViewDisplay}
        //         setEditModeData={setEditModeData}
        //         setMsgData={setMsgData}
		// 		showing={showing} 
        //         size={size}
        //         setSizeCommandData={setSizeCommandData} />
        // },
        getConfigViewModeEntry(getFormLayout),
    ],
    iconResPath: "/icons3/mapCellIcon.png"
}
export default WebRequestComponentConfig;

__globals__.WebRequestCell = {};
addNameToModelGlobals("WebRequestCell");


WebRequestCell.formResultToRequest = function(formResult) {
    let url = formResult.url;
    if(url) {
        //construct options
        let options = {};
        //method
        options.method = formResult.method;  
        //body
        if(formResult.body) {
            //take a JSON or a string. If it is a json, we will stringify it.
            if((typeof formResult.body == "object")&&((formResult.body instanceof String) == false)) {
                options.body = JSON.stringify(formResult.body);
            }
            else {
                options.body = formResult.body;
            }
        }
        //content type (header)
        //note - if they specify a content type here and below we will just include both
        let headers;
        if((formResult.contentType)&&(formResult.contentType != "none")&&(formResult.contentType != "other")) {
            headers = {};
            headers["content-type"] = formResult.contentType;
        }
        //headers
        if((formResult.headers)&&(formResult.headers.length > 0)) {
            if(!headers) headers = {};
            formResult.headers.forEach(entry => headers[entry.headerKey] = entry.headerValue);
        }
        if(headers) options.headers = headers;

        //make the request, with apogee specific error handling
        let bodyFormat = formResult.outputFormat;
        let saveMetadata = true;
        let noFailedRequestError = (formResult.onError == "noError");
        return apogeeutil.httpRequest(url,options,bodyFormat,saveMetadata,noFailedRequestError);
    }
    else {
        return {
            meta: "",
            body: ""
        };
    }
}

