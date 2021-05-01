import {defineHardcodedJsonTable} from "/apogeejs-model-lib/src/apogeeModelLib.js";
import FormInputBaseComponent from "/apogeejs-app-lib/src/components/FormInputBaseComponent.js";

/** This is a simple custom component example. */
export default class WebRequestComponent extends FormInputBaseComponent {
    constructor(member,modelManager,instanceToCopy,keepUpdatedFixed) {
        super(member,modelManager,instanceToCopy,keepUpdatedFixed);
    }
}

const DATA_MEMBER_FUNCTION_BODY = `
return WebRequestCell.formResultToRequest(formResult);
`

__globals__.WebRequestCell = {};
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

//this defines the hardcoded type we will use
let dataMemberTypeName = "apogee.WebRequestMember";
defineHardcodedJsonTable(dataMemberTypeName,DATA_MEMBER_FUNCTION_BODY);

//here we define the component
FormInputBaseComponent.initializeClass(WebRequestComponent,"Web Request Cell","apogeeapp.WebRequestCell",dataMemberTypeName);