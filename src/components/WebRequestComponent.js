import Component from "/apogeejs-app-lib/src/component/Component.js";
import {getFormComponentDefaultMemberJson} from "/apogeejs-app-lib/src/components/formInputComponentUtils.js";
import {defineHardcodedJsonTable} from "/apogeejs-model-lib/src/apogeeModelLib.js";

/** This is a web request component. */
export default class WebRequestComponent extends Component {};

const DATA_MEMBER_FUNCTION_BODY = `
return WebRequestCell.formResultToRequest(formResult);
`

//this defines the hardcoded type we will use
let dataMemberTypeName = "apogee.WebRequestMember";
defineHardcodedJsonTable(dataMemberTypeName,DATA_MEMBER_FUNCTION_BODY);

//here we configure the component
WebRequestComponent.CLASS_CONFIG = {
    displayName: "Web Request Cell",
    uniqueName: "apogeeapp.WebRequestCell",
    defaultMemberJson: getFormComponentDefaultMemberJson(dataMemberTypeName)
}


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

