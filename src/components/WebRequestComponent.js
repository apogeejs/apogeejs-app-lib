import Component from "/apogeejs-app-lib/src/component/Component.js";
import {getFormComponentDefaultMemberJson} from "/apogeejs-app-lib/src/components/formInputComponentUtils.js";
import {defineHardcodedDataMember} from "/apogeejs-model-lib/src/apogeeModelLib.js";

import {getConfigViewModeEntry}  from "/apogeejs-view-lib/src/componentviews/FormInputBaseComponentView.js";
import AceTextEditor from "/apogeejs-view-lib/src/datadisplay/AceTextEditor.js";
import dataDisplayHelper from "/apogeejs-view-lib/src/datadisplay/dataDisplayHelper.js";
import {getErrorViewModeEntry} from "/apogeejs-view-lib/src/datasource/standardDataDisplay.js";


const DATA_MEMBER_FUNCTION_BODY = `
return WebRequestCell.formResultToRequest(formResult);
`

//this defines the hardcoded type we will use
let dataMemberTypeName = "apogee.WebRequestMember";
defineHardcodedDataMember(dataMemberTypeName,DATA_MEMBER_FUNCTION_BODY);

///////////////////////////////////////////////////////
// view code
////////////////////////////////////////////////////////


function getMetaViewDisplay(componentHolder,displayContainer) {
    let dataDisplaySource = _getMetaDataSource(componentHolder);
    return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/json",AceTextEditor.OPTION_SET_DISPLAY_SOME);
}

function getBodyViewDisplay(componentHolder,displayContainer) {
    let dataDisplaySource = _getBodyDataSource(componentHolder);
    return new AceTextEditor(displayContainer,dataDisplaySource,"ace/mode/text",AceTextEditor.OPTION_SET_DISPLAY_SOME);
}

/** This method returns the form layout.
 * @protected. */
function getFormLayout(/*component*/) {
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

function _getBodyDataSource(componentHolder) {
    return {
        doUpdate: () => {
            //return value is whether or not the data display needs to be udpated
            let component = componentHolder.getComponent()
            let reloadData = component.isMemberDataUpdated("member.data");
            let reloadDataDisplay = false;
            return {reloadData,reloadDataDisplay};
        },

        getData: () => {
            //Here we return just the body (not header), converted to text if needed
            let component = componentHolder.getComponent()
            let wrappedData = dataDisplayHelper.getWrappedMemberData(component,"member.data");
            if(wrappedData.data !== apogeeutil.INVALID_VALUE) {
                let bodyAndMeta = wrappedData.data;
                if(!bodyAndMeta) {
                    wrappedData.data = "";
                }
                else if(bodyAndMeta.body === undefined) {
                    //just display an empty body
                    wrappedData.data = "";
                }
                else {
                    if(typeof bodyAndMeta.body == "string") {
                        wrappedData.data = bodyAndMeta.body;      
                    }
                    else {
                        wrappedData.data = JSON.stringify(bodyAndMeta.body);
                    }
                }
            }
            return wrappedData;
        }
    }
}

function _getMetaDataSource(componentHolder) {
    return {
        doUpdate: () => {
            //return value is whether or not the data display needs to be udpated
            let component = componentHolder.getComponent()
            let reloadData = component.isMemberDataUpdated("member.data");
            let reloadDataDisplay = false;
            return {reloadData,reloadDataDisplay};
        },

        getData: () => {
            //Here we return just the meta data, as text
            let component = componentHolder.getComponent()
            let wrappedData = dataDisplayHelper.getWrappedMemberData(component,"member.data");
            if(wrappedData.data !== apogeeutil.INVALID_VALUE) {
                let bodyAndMeta = wrappedData.data;
                if((!bodyAndMeta)||(!bodyAndMeta.meta)) {
                    wrappedData.data = "";
                }
                else {
                    wrappedData.data = JSON.stringify(bodyAndMeta.meta);
                }
            }
            return wrappedData;
        }
    }
}


//===============================
// config
//===============================

const WebRequestComponentConfig = {
    componentClass: Component,
    displayName: "Web Request Cell",
    defaultMemberJson: getFormComponentDefaultMemberJson(dataMemberTypeName),
    defaultComponentJson: {
        type: "apogeeapp.WebRequestCell"
    },

    viewModes: [
        getErrorViewModeEntry(),
        {
            name: "Meta",
            label: "Response Info",
            sourceLayer: "model", 
            sourceType: "data",
            suffix: ".data.meta",
            isActive: false,
            getDataDisplay: (componentHolder,displayContainer) => getMetaViewDisplay(componentHolder,displayContainer)
    
        },
        {
            name: "Body",
            label: "Response Body",
            sourceLayer: "model", 
            sourceType: "data",
            suffix: ".data.body",
            isActive: true,
            getDataDisplay: (componentHolder,displayContainer) => getBodyViewDisplay(componentHolder,displayContainer)
        },
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

