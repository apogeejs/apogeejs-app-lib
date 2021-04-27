import {defineHardcodedJsonTable} from "/apogeejs-model-lib/src/apogeeModelLib.js";
import FormInputBaseComponent from "/apogeejs-app-lib/src/components/FormInputBaseComponent.js";

/** This is a simple custom component example. */
export default class WebRequestComponent extends FormInputBaseComponent {
    constructor(member,modelManager,instanceToCopy,keepUpdatedFixed) {
        super(member,modelManager,instanceToCopy,keepUpdatedFixed);
    }
}

const DATA_MEMBER_FUNCTION_BODY = `
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
        //headers
        let headersIn = formResult.headers;
        if((headersIn)&&(headersIn.length > 0)) {
            let headers = {};
            headersIn.forEach(entry => headers[entry.headerKey] = entry.headerValue);
            options.headers = headers;
        }

        return fetch(url,options).then(response => {
            //store meta data for response
            let meta = {};
            meta.status = response.status;
            meta.headers = {};
            for (let pair of response.headers.entries()) {
            meta.headers[pair[0]] = pair[1];
            }
            
            //save the body
            let responseBodyPromise;
            let bodyFormat;
            if(formResult.outputFormat == "mime") {
                let contentType = meta.headers["content-type"];
                if((conttentType)&&(contentType.startsWith("application/json"))) bodyFormat = "json";
                else if(contentType !== undefined) bodyFormat = "text";
                else bodyFormat = "none";
            }
            else if(formResult.outputFormat == "json") bodyFormat = "json";
            else if(formResult.outputFormat == "none") bodyFormat = "none";
            else bodyFormat = "text";
            
            switch(bodyFormat) {
                case "text":
                    responseBodyPromise = response.text();
                    break;
                    
                case "json": 
                    responseBodyPromise = response.json();
                    break;
                    
                case "none":
                    responseBodyPromise = Promise.resolve("");
                    break;
            }
            
            return responseBodyPromise.then(body => {
                let value = {
                    meta: meta,
                    body: body
                }
                if((response.ok)||(formResult.onError == "noError")) {
                    return value;
                }
                else {
                    let msg = "Error in request. Status code: " + response.status;
                    if(response.statusText) msg += "; " + response.statusText
                    let error = new Error(msg);
                    error.valueData = {
                        value: value,
                        nominalType: "application/json",
                        stringified: false
                    }
                    return Promise.reject(error)
                }
            })
        })
    }
    else {
        return apogeeutil.INVALID_VALUE;
    }
`

//this defines the hardcoded type we will use
let dataMemberTypeName = "apogee.WebRequestMember";
defineHardcodedJsonTable(dataMemberTypeName,DATA_MEMBER_FUNCTION_BODY);

//here we define the component
FormInputBaseComponent.initializeClass(WebRequestComponent,"Web Request Cell","apogeeapp.WebRequestCell",dataMemberTypeName);
